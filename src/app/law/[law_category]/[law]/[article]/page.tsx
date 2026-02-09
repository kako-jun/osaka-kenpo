import type { Metadata } from 'next';
import { getArticle, getArticles, getLawMetadata, type ArticleRow } from '@/lib/db';
import { ArticleClient } from './ArticleClient';
import { lawsMetadata } from '@/data/lawsMetadata';
import { formatArticleNumber } from '@/lib/utils';

export const runtime = 'edge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ law_category: string; law: string; article: string }>;
}): Promise<Metadata> {
  const { law_category, law, article } = await params;
  const staticLaw = lawsMetadata.categories.flatMap((c) => c.laws).find((l) => l.id === law);
  const lawName = staticLaw?.shortName || law;

  const articleRow = await getArticle(law_category, law, article);
  const articleLabel = formatArticleNumber(article);
  const articleTitle = articleRow?.title ? `${articleLabel}（${articleRow.title}）` : articleLabel;
  const title = `${articleTitle} - ${lawName} - おおさかけんぽう`;

  let description = `${lawName} ${articleLabel}を大阪弁で親しみやすく解説。`;
  if (articleRow?.osaka_text) {
    try {
      const parsed = JSON.parse(articleRow.osaka_text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const firstLine = String(parsed[0]).replace(/\s+/g, ' ').trim();
        if (firstLine.length > 0) {
          description = firstLine.length > 100 ? firstLine.slice(0, 100) + '...' : firstLine;
        }
      }
    } catch {
      // ignore
    }
  }

  const url = `/law/${law_category}/${law}/${article}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ law_category: string; law: string; article: string }>;
}) {
  const { law_category, law, article } = await params;

  let articleRow, allArticlesRows, lawMetadata;
  try {
    // D1から並行でデータ取得
    [articleRow, allArticlesRows, lawMetadata] = await Promise.all([
      getArticle(law_category, law, article),
      getArticles(law_category, law),
      getLawMetadata(law_category, law),
    ]);
  } catch (error) {
    console.error('DB Error:', error);
    return (
      <div className="min-h-screen bg-cream">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-primary mb-4">データ取得エラー</h1>
            <p className="text-gray-600 mb-4">{String(error)}</p>
            <a href="/" className="text-blue-600 hover:underline">
              トップページに戻る
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!articleRow) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-primary mb-4">条文が見つかりません</h1>
            <a href="/" className="text-blue-600 hover:underline">
              トップページに戻る
            </a>
          </div>
        </div>
      </div>
    );
  }

  const staticLaw = lawsMetadata.categories.flatMap((c) => c.laws).find((l) => l.id === law);
  const lawName =
    lawMetadata?.short_name || lawMetadata?.display_name || staticLaw?.shortName || law;

  // D1のカラムからArticleData形式に変換
  const articleData = {
    article: articleRow.article,
    title: articleRow.title || '',
    titleOsaka: articleRow.title_osaka || undefined,
    originalText: JSON.parse(articleRow.original_text || '[]'),
    osakaText: JSON.parse(articleRow.osaka_text || '[]'),
    commentary: JSON.parse(articleRow.commentary || '[]'),
    commentaryOsaka: articleRow.commentary_osaka
      ? JSON.parse(articleRow.commentary_osaka)
      : undefined,
  };

  // 全条文リストをクライアント用に変換
  const allArticles = allArticlesRows.map((a: ArticleRow) => {
    let originalTextExcerpt: string | undefined;
    if (!a.title && a.original_text) {
      try {
        const parsed = JSON.parse(a.original_text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstLine = parsed[0].replace(/\s+/g, ' ').trim();
          originalTextExcerpt = firstLine.length > 12 ? firstLine.slice(0, 12) + '...' : firstLine;
        }
      } catch {
        // ignore parse errors
      }
    }
    return {
      article: a.article,
      title: a.title || '',
      titleOsaka: a.title_osaka || undefined,
      originalText: originalTextExcerpt,
    };
  });

  return (
    <ArticleClient
      lawCategory={law_category}
      law={law}
      articleId={article}
      articleData={articleData}
      lawName={lawName}
      allArticles={allArticles}
    />
  );
}
