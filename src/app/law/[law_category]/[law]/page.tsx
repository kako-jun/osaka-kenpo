import type { Metadata } from 'next';
import {
  getArticles,
  getLawMetadata,
  getChapters,
  getFamousArticles,
  type ArticleRow,
  type ChapterRow,
} from '@/lib/db';
import { ShareButton } from '@/app/components/ShareButton';
import { ArticleListWithEeyan } from './components/ArticleListWithEeyan';
import { Pagination } from '@/app/components/Pagination';
import { lawsMetadata } from '@/data/lawsMetadata';
import { getArticleSortKey } from '@/lib/utils';

export const runtime = 'edge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ law_category: string; law: string }>;
}): Promise<Metadata> {
  const { law_category, law } = await params;
  const staticLaw = lawsMetadata.categories.flatMap((c) => c.laws).find((l) => l.id === law);
  const lawName = staticLaw?.shortName || law;
  const title = `${lawName} - おおさかけんぽう`;
  const description = `${lawName}の条文一覧。大阪弁で親しみやすく解説。`;
  const url = `/law/${law_category}/${law}`;

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

const ARTICLES_PER_PAGE = 100;

// 原文JSONから最初の段落を取得
function getFirstParagraph(originalTextJson: string | null | undefined): string {
  if (!originalTextJson) return '';
  try {
    const parsed = JSON.parse(originalTextJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return String(parsed[0]);
    }
  } catch {
    // パース失敗時は空文字
  }
  return '';
}

// 条文番号から基本番号を抽出（1-2 → 1, 876-5 → 876）
function getBaseArticleNumber(article: string): number {
  // suppl_1 や amendment_1 は特別扱い
  if (article.startsWith('suppl_') || article.startsWith('amendment_')) {
    return -1; // 附則は別扱い
  }
  // 枝番（1-2など）は基本番号を返す
  const match = article.match(/^(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return -1;
}

// 条文を分類
function classifyArticles(articles: ArticleRow[]) {
  const normal: ArticleRow[] = [];
  const supplementary: ArticleRow[] = [];

  for (const article of articles) {
    const articleStr = String(article.article);
    if (articleStr.startsWith('suppl_') || articleStr.startsWith('amendment_')) {
      supplementary.push(article);
    } else {
      normal.push(article);
    }
  }

  // ソート
  normal.sort(
    (a, b) => getArticleSortKey(String(a.article)) - getArticleSortKey(String(b.article))
  );
  supplementary.sort(
    (a, b) => getArticleSortKey(String(a.article)) - getArticleSortKey(String(b.article))
  );

  return { normal, supplementary };
}

// 条文番号の範囲でページを計算
function getArticlePageRanges(
  articles: ArticleRow[]
): { start: number; end: number; label: string }[] {
  if (articles.length === 0) return [];

  // 最大の条文番号を取得
  let maxArticleNum = 0;
  for (const article of articles) {
    const baseNum = getBaseArticleNumber(String(article.article));
    if (baseNum > maxArticleNum) {
      maxArticleNum = baseNum;
    }
  }

  // 100条ごとにページを作成
  const ranges: { start: number; end: number; label: string }[] = [];
  for (let start = 1; start <= maxArticleNum; start += ARTICLES_PER_PAGE) {
    const end = start + ARTICLES_PER_PAGE - 1;
    ranges.push({
      start,
      end,
      label: `${start}〜${Math.min(end, maxArticleNum)}条`,
    });
  }

  return ranges;
}

// 指定された条文番号範囲の条文をフィルタ
function filterArticlesByRange(articles: ArticleRow[], start: number, end: number): ArticleRow[] {
  return articles.filter((article) => {
    const baseNum = getBaseArticleNumber(String(article.article));
    return baseNum >= start && baseNum <= end;
  });
}

// ArticleRow[] を ArticleListWithEeyan 用のデータに変換
function toArticleData(
  articles: ArticleRow[],
  law_category: string,
  law: string,
  famousArticles: Record<string, string>,
  includeOriginalText = false
) {
  return articles.map((article) => ({
    article: article.article,
    title: article.title || '',
    href: `/law/${law_category}/${law}/${article.article}`,
    famousArticleBadge: famousArticles?.[article.article.toString()] || null,
    isDeleted: article.is_deleted === 1,
    originalText: includeOriginalText ? getFirstParagraph(article.original_text) : undefined,
  }));
}

export default async function LawArticlesPage({
  params,
  searchParams,
}: {
  params: Promise<{ law_category: string; law: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { law_category, law } = await params;
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams.page;
  const currentPage = typeof pageParam === 'string' ? parseInt(pageParam, 10) || 1 : 1;

  // D1から並行でデータ取得
  const [articles, lawMetadata, chapters, famousArticles] = await Promise.all([
    getArticles(law_category, law),
    getLawMetadata(law_category, law),
    getChapters(law_category, law),
    getFamousArticles(law_category, law),
  ]);

  const staticLaw = lawsMetadata.categories.flatMap((c) => c.laws).find((l) => l.id === law);
  const lawName = staticLaw?.shortName || law;
  const lawFullName = lawMetadata?.display_name || lawName;

  if (!articles || articles.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">条文が見つかりませんでした。</div>
          <a href="/" className="text-blue-600 hover:underline">
            トップページに戻る
          </a>
        </div>
      </div>
    );
  }

  // 章でグループ化（章構成がある法律用）
  const hasChapters = chapters && chapters.length > 0;
  const groupedArticles: { [chapterKey: string]: { chapter: ChapterRow; articles: ArticleRow[] } } =
    {};

  if (hasChapters) {
    for (const chapter of chapters) {
      const chapterKey = String(chapter.chapter);
      const chapterArticlesList = JSON.parse(chapter.articles || '[]') as string[];
      groupedArticles[chapterKey] = {
        chapter,
        articles: articles.filter((article) =>
          chapterArticlesList.some(
            (chapterArticle) => String(chapterArticle) === String(article.article)
          )
        ),
      };
    }
  }

  // 条文を分類
  const { normal, supplementary } = classifyArticles(articles);

  // 条文番号ベースでページ範囲を計算
  const pageRanges = getArticlePageRanges(normal);
  const needsPagination = pageRanges.length > 1;

  // 現在のページの条文番号範囲
  const currentRange = pageRanges[currentPage - 1] || pageRanges[0];
  const currentArticles = needsPagination
    ? filterArticlesByRange(normal, currentRange.start, currentRange.end)
    : normal;

  const basePath = `/law/${law_category}/${law}`;

  // 附則ページかどうか
  const isSupplPage = pageParam === 'suppl';

  return (
    <div className="min-h-screen bg-cream">
      {/* 右上にシェアボタン */}
      <div className="fixed top-20 right-4 z-10">
        <ShareButton />
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#E94E77]">{lawName}</h1>
          {lawFullName !== lawName && <p className="text-sm text-gray-600 mt-2">{lawFullName}</p>}
        </div>

        {/* 出典情報 */}
        {lawMetadata && (
          <div className="max-w-4xl mx-auto mb-8 bg-blue-50 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] p-6 border border-blue-100">
            <h2 className="text-lg font-bold text-gray-800 mb-3">📚 出典・参考資料</h2>
            <div className="space-y-2 text-sm text-gray-600">
              {lawMetadata.source && (
                <p>
                  <strong>出典：</strong>
                  {lawMetadata.source}
                </p>
              )}
              {lawMetadata.description && <p>{lawMetadata.description}</p>}
            </div>
          </div>
        )}

        {/* ページネーション（条文数が多い場合） */}
        {needsPagination && (
          <div className="max-w-4xl mx-auto mb-6">
            <Pagination
              basePath={basePath}
              pageRanges={pageRanges}
              currentPage={currentPage}
              isSupplPage={isSupplPage}
              hasSupplementary={supplementary.length > 0}
            />
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {isSupplPage ? (
            // 附則ページ
            <div>
              <h2 className="text-xl font-bold text-[#E94E77] border-b-2 border-[#E94E77] pb-2 mb-4">
                附則
              </h2>
              <ArticleListWithEeyan
                articles={toArticleData(supplementary, law_category, law, famousArticles, true)}
                lawCategory={law_category}
                law={law}
              />
            </div>
          ) : hasChapters && !needsPagination ? (
            // 章構成があり、ページングが不要な場合
            Object.values(groupedArticles)
              .filter((group) => group.articles.length > 0)
              .map(({ chapter, articles: chapterArticles }) => (
                <div key={chapter.chapter} className="mb-8">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-[#E94E77] border-b-2 border-[#E94E77] pb-2">
                      {chapter.title}
                    </h2>
                    {chapter.description && (
                      <p className="text-sm text-gray-600 mt-2">{chapter.description}</p>
                    )}
                  </div>

                  <ArticleListWithEeyan
                    articles={toArticleData(chapterArticles, law_category, law, famousArticles)}
                    lawCategory={law_category}
                    law={law}
                  />
                </div>
              ))
          ) : (
            // ページング表示（または章構成がない場合）
            <ArticleListWithEeyan
              articles={toArticleData(currentArticles, law_category, law, famousArticles, true)}
              lawCategory={law_category}
              law={law}
            />
          )}

          {/* 附則セクション（ページングがなく、通常条文と一緒に表示する場合） */}
          {!needsPagination && supplementary.length > 0 && !isSupplPage && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-[#E94E77] border-b-2 border-[#E94E77] pb-2 mb-4">
                附則
              </h2>
              <ArticleListWithEeyan
                articles={toArticleData(supplementary, law_category, law, famousArticles, true)}
                lawCategory={law_category}
                law={law}
              />
            </div>
          )}
        </div>

        {/* 下部ページネーション */}
        {needsPagination && (
          <div className="max-w-4xl mx-auto mt-8">
            <Pagination
              basePath={basePath}
              pageRanges={pageRanges}
              currentPage={currentPage}
              isSupplPage={isSupplPage}
              hasSupplementary={supplementary.length > 0}
            />
          </div>
        )}
      </div>
    </div>
  );
}
