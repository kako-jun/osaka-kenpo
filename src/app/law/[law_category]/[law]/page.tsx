import {
  getArticles,
  getLawMetadata,
  getChapters,
  getFamousArticles,
  type ArticleRow,
  type ChapterRow,
} from '@/lib/db';
import { ShareButton } from '@/app/components/ShareButton';
import { ArticleListItem } from '@/app/components/ArticleListItem';
import { Pagination, getPageRanges } from '@/app/components/Pagination';
import { lawsMetadata } from '@/data/lawsMetadata';

export const runtime = 'edge';

const ARTICLES_PER_PAGE = 100;

// 条文番号から数値を抽出（ソート用）
function getArticleNumber(article: string): number {
  // suppl_1 → 100000 + 1 = 100001
  if (article.startsWith('suppl_')) {
    return 100000 + parseInt(article.replace('suppl_', ''), 10);
  }
  // amendment_1 → 200000 + 1 = 200001
  if (article.startsWith('amendment_')) {
    return 200000 + parseInt(article.replace('amendment_', ''), 10);
  }
  // 1-2 → 1.5 のような枝番
  const match = article.match(/^(\d+)-(\d+)$/);
  if (match) {
    return parseInt(match[1], 10) + parseInt(match[2], 10) * 0.001;
  }
  // 通常の数値
  const num = parseInt(article, 10);
  return isNaN(num) ? 999999 : num;
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
  normal.sort((a, b) => getArticleNumber(String(a.article)) - getArticleNumber(String(b.article)));
  supplementary.sort(
    (a, b) => getArticleNumber(String(a.article)) - getArticleNumber(String(b.article))
  );

  return { normal, supplementary };
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
  const totalNormalArticles = normal.length;
  const needsPagination = totalNormalArticles > ARTICLES_PER_PAGE;

  // ページング計算
  const pageRanges = getPageRanges(totalNormalArticles, ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = Math.min(startIndex + ARTICLES_PER_PAGE, totalNormalArticles);
  const currentArticles = needsPagination ? normal.slice(startIndex, endIndex) : normal;
  const basePath = `/law/${law_category}/${law}`;

  // 附則ページかどうか
  const showSupplementary = pageParam === 'suppl' || (!needsPagination && supplementary.length > 0);
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
              {supplementary.map((article) => (
                <ArticleListItem
                  key={article.article}
                  article={article.article}
                  title={article.title || ''}
                  href={`/law/${law_category}/${law}/${article.article}`}
                  famousArticleBadge={famousArticles?.[article.article.toString()]}
                  isDeleted={article.is_deleted === 1}
                />
              ))}
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

                  {chapterArticles.map((article) => (
                    <ArticleListItem
                      key={article.article}
                      article={article.article}
                      title={article.title || ''}
                      href={`/law/${law_category}/${law}/${article.article}`}
                      famousArticleBadge={famousArticles?.[article.article.toString()]}
                      isDeleted={article.is_deleted === 1}
                    />
                  ))}
                </div>
              ))
          ) : (
            // ページング表示（または章構成がない場合）
            <>
              {needsPagination && (
                <div className="mb-4 text-center text-gray-600">
                  第{startIndex + 1}条〜第{endIndex}条を表示中（全{totalNormalArticles}条）
                </div>
              )}
              {currentArticles.map((article) => (
                <ArticleListItem
                  key={article.article}
                  article={article.article}
                  title={article.title || ''}
                  href={`/law/${law_category}/${law}/${article.article}`}
                  famousArticleBadge={famousArticles?.[article.article.toString()]}
                  isDeleted={article.is_deleted === 1}
                />
              ))}
            </>
          )}

          {/* 附則セクション（ページングがなく、通常条文と一緒に表示する場合） */}
          {!needsPagination && supplementary.length > 0 && !isSupplPage && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-[#E94E77] border-b-2 border-[#E94E77] pb-2 mb-4">
                附則
              </h2>
              {supplementary.map((article) => (
                <ArticleListItem
                  key={article.article}
                  article={article.article}
                  title={article.title || ''}
                  href={`/law/${law_category}/${law}/${article.article}`}
                  famousArticleBadge={famousArticles?.[article.article.toString()]}
                  isDeleted={article.is_deleted === 1}
                />
              ))}
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
