import Link from 'next/link';
import { getDB, getArticles, getLawMetadata, getChapters, getFamousArticles } from '@/lib/db';
import { ShareButton } from '@/app/components/ShareButton';

export const runtime = 'edge';

export default async function LawArticlesPage({
  params,
}: {
  params: Promise<{ law_category: string; law: string }>;
}) {
  const { law_category, law } = await params;

  // D1から並行でデータ取得
  const [articles, lawMetadata, chapters, famousArticles] = await Promise.all([
    getArticles(law_category, law),
    getLawMetadata(law_category, law),
    getChapters(law_category, law),
    getFamousArticles(law_category, law),
  ]);

  const lawName = (lawMetadata as any)?.short_name || (lawMetadata as any)?.display_name || law;
  const lawFullName = (lawMetadata as any)?.display_name || law;
  const lawSource = lawMetadata as any;

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

  // 章でグループ化
  const hasChapters = chapters && chapters.length > 0;
  let groupedArticles: { [chapterKey: string]: { chapter: any; articles: any[] } } = {};

  if (hasChapters) {
    for (const chapter of chapters as any[]) {
      const chapterKey = String(chapter.chapter);
      const chapterArticlesList = JSON.parse(chapter.articles || '[]');
      groupedArticles[chapterKey] = {
        chapter,
        articles: (articles as any[]).filter((article) =>
          chapterArticlesList.some(
            (chapterArticle: any) => String(chapterArticle) === String(article.article)
          )
        ),
      };
    }
  }

  // 条文番号フォーマット
  const formatArticleNumber = (article: string | number) => {
    if (typeof article === 'number') return `第${article}条`;
    if (String(article).startsWith('fusoku_')) {
      return `附則第${String(article).replace('fusoku_', '')}条`;
    }
    return `第${article}条`;
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* 右上にシェアボタン */}
      <div className="fixed top-20 right-4 z-10">
        <ShareButton />
      </div>
      <div className="container mx-auto px-4 py-8">
        {lawSource?.short_name ? (
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#E94E77]">{lawSource.short_name}</h1>
            <p className="text-sm text-gray-600 mt-2">{lawFullName}</p>
          </div>
        ) : (
          <h1 className="text-2xl font-bold mb-6 text-center text-[#E94E77]">{lawName}</h1>
        )}

        {/* 出典情報 */}
        {lawSource && (
          <div className="max-w-4xl mx-auto mb-8 bg-blue-50 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] p-6 border border-blue-100">
            <h2 className="text-lg font-bold text-gray-800 mb-3">📚 出典・参考資料</h2>
            <div className="space-y-2 text-sm text-gray-600">
              {lawSource.source && (
                <p>
                  <strong>出典：</strong>
                  {lawSource.source}
                </p>
              )}
              {lawSource.description && <p>{lawSource.description}</p>}
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {hasChapters
            ? // 章構成がある場合
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

                    {chapterArticles.map((article: any) => {
                      const famousArticleBadge = famousArticles?.[article.article.toString()];

                      return (
                        <Link
                          key={article.article}
                          href={`/law/${law_category}/${law}/${article.article}`}
                        >
                          <div className="block p-6 bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-shadow cursor-pointer border-l-4 border-[#E94E77] mb-4 relative">
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <span className="font-bold text-[#E94E77] text-lg mb-2 sm:mb-0 sm:mr-4">
                                {formatArticleNumber(article.article)}
                              </span>
                              {article.title && article.title.trim() !== '' && (
                                <div className="text-gray-800 text-base leading-relaxed">
                                  <span dangerouslySetInnerHTML={{ __html: article.title }} />
                                </div>
                              )}
                            </div>

                            {famousArticleBadge && (
                              <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white shadow-md bg-slate-500">
                                {famousArticleBadge}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ))
            : // 章構成がない場合
              (articles as any[]).map((article) => {
                const famousArticleBadge = famousArticles?.[article.article.toString()];

                return (
                  <Link
                    key={article.article}
                    href={`/law/${law_category}/${law}/${article.article}`}
                  >
                    <div className="block p-6 bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-shadow cursor-pointer border-l-4 border-[#E94E77] mb-4 relative">
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-bold text-[#E94E77] text-lg mb-2 sm:mb-0 sm:mr-4">
                          {formatArticleNumber(article.article)}
                        </span>
                        {article.title && article.title.trim() !== '' && (
                          <div className="text-gray-800 text-base leading-relaxed">
                            <span dangerouslySetInnerHTML={{ __html: article.title }} />
                          </div>
                        )}
                      </div>

                      {famousArticleBadge && (
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white shadow-md bg-slate-500">
                          {famousArticleBadge}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>
    </div>
  );
}
