import { getArticle, getArticles, getLawMetadata } from '@/lib/db';
import { ArticleClient } from './ArticleClient';
import { lawsMetadata } from '@/data/lawsMetadata';

export const runtime = 'edge';

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ law_category: string; law: string; article: string }>;
}) {
  const { law_category, law, article } = await params;

  // D1から並行でデータ取得
  const [articleRow, allArticlesRows, lawMetadata] = await Promise.all([
    getArticle(law_category, law, article),
    getArticles(law_category, law),
    getLawMetadata(law_category, law),
  ]);

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

  const row = articleRow as any;
  const staticLaw = lawsMetadata.categories.flatMap((c) => c.laws).find((l) => l.id === law);
  const lawName =
    (lawMetadata as any)?.short_name ||
    (lawMetadata as any)?.display_name ||
    staticLaw?.shortName ||
    law;

  // D1のカラムからArticleData形式に変換
  const articleData = {
    article: row.article,
    title: row.title || '',
    titleOsaka: row.title_osaka || undefined,
    originalText: JSON.parse(row.original_text || '[]'),
    osakaText: JSON.parse(row.osaka_text || '[]'),
    commentary: JSON.parse(row.commentary || '[]'),
    commentaryOsaka: row.commentary_osaka ? JSON.parse(row.commentary_osaka) : undefined,
  };

  // 全条文リストをクライアント用に変換
  const allArticles = (allArticlesRows as any[]).map((a) => ({
    article: a.article,
    title: a.title || '',
    titleOsaka: a.title_osaka || undefined,
  }));

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
