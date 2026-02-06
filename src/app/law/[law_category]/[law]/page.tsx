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
import { lawsMetadata } from '@/data/lawsMetadata';

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

  // 章でグループ化
  const hasChapters = chapters && chapters.length > 0;
  let groupedArticles: { [chapterKey: string]: { chapter: ChapterRow; articles: ArticleRow[] } } =
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

                    {chapterArticles.map((article) => (
                      <ArticleListItem
                        key={article.article}
                        article={article.article}
                        title={article.title}
                        href={`/law/${law_category}/${law}/${article.article}`}
                        famousArticleBadge={famousArticles?.[article.article.toString()]}
                      />
                    ))}
                  </div>
                ))
            : // 章構成がない場合
              articles.map((article) => (
                <ArticleListItem
                  key={article.article}
                  article={article.article}
                  title={article.title}
                  href={`/law/${law_category}/${law}/${article.article}`}
                  famousArticleBadge={famousArticles?.[article.article.toString()]}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
