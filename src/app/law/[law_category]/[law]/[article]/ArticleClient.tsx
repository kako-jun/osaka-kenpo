import Link from 'next/link';
import { useViewMode } from '@/app/context/ViewModeContext';
import { SpeakerButton } from '@/components/SpeakerButton';
import { ShareButton } from '@/app/components/ShareButton';
import { LikeButton } from '@/app/components/LikeButton';
import { ArticleNavigation } from '@/app/components/ArticleNavigation';
import { AnimatedContent } from '@/app/components/AnimatedContent';
import { highlightKeywords } from '@/lib/text_highlight';
import { formatArticleNumber } from '@/lib/utils';
import { useArticleNavigation } from '@/hooks/useArticleNavigation';
import {
  LightBulbIcon,
  ChatBubbleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@/components/icons';

interface ArticleClientProps {
  lawCategory: string;
  law: string;
  articleId: string;
  articleData: {
    article: string | number;
    title: string;
    titleOsaka?: string;
    originalText: string[];
    osakaText: string[];
    commentary: string[];
    commentaryOsaka?: string[];
  };
  lawName: string;
  allArticles: { article: string | number; title: string; titleOsaka?: string }[];
}

export function ArticleClient({
  lawCategory,
  law,
  articleId,
  articleData,
  lawName,
  allArticles,
}: ArticleClientProps) {
  const { viewMode, setViewMode } = useViewMode();

  const showOsaka = viewMode === 'osaka';

  const toggleViewMode = () => {
    setViewMode(viewMode === 'osaka' ? 'original' : 'osaka');
  };

  // 前後の条文を計算
  const currentIndex = allArticles.findIndex(
    (a) => String(a.article) === String(articleData.article)
  );
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1]?.article : null;
  const nextArticle =
    currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1]?.article : null;

  // カスタムhookでナビゲーション処理を管理
  const { navigateToArticle } = useArticleNavigation({
    lawCategory,
    law,
    viewMode,
    toggleViewMode,
    prevArticle,
    nextArticle,
  });

  return (
    <main className="min-h-screen bg-cream relative">
      {/* 左上にええやんボタン */}
      <div className="fixed top-20 left-4 z-10">
        <LikeButton articleId={articleId} lawCategory={lawCategory} law={law} />
      </div>

      {/* 右上に広めたるボタン */}
      <div className="fixed top-20 right-4 z-10">
        <ShareButton />
      </div>

      {/* 前の条文への矢印 */}
      {prevArticle && (
        <button
          onClick={() => navigateToArticle(prevArticle)}
          className="fixed left-0 top-32 bottom-32 w-8 z-[1] text-gray-300 hover:text-[#E94E77] transition-all flex items-center justify-center group"
          title={`${formatArticleNumber(prevArticle)}へ`}
          style={{ background: 'transparent' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-80 transition-opacity"></div>
          <ChevronLeftIcon className="relative z-10" />
        </button>
      )}

      {/* 次の条文への矢印 */}
      {nextArticle && (
        <button
          onClick={() => navigateToArticle(nextArticle)}
          className="fixed right-0 top-32 bottom-32 w-8 z-[1] text-gray-300 hover:text-[#E94E77] transition-all flex items-center justify-center group"
          title={`${formatArticleNumber(nextArticle)}へ`}
          style={{ background: 'transparent' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-80 transition-opacity"></div>
          <ChevronRightIcon className="relative z-10" />
        </button>
      )}

      <div id="page-content">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-4">
            <Link
              href={`/law/${lawCategory}/${law}`}
              className="inline-block text-lg text-gray-600 mb-2 hover:text-[#E94E77] transition-colors"
            >
              {lawName}
            </Link>
            <AnimatedContent
              showOsaka={showOsaka}
              originalContent={
                <h1 className="text-2xl font-bold mb-6">
                  <span className="text-[#E94E77]">
                    {formatArticleNumber(articleData.article)}{' '}
                  </span>
                  <span
                    className="text-gray-800"
                    dangerouslySetInnerHTML={{ __html: articleData.title }}
                  />
                </h1>
              }
              osakaContent={
                <h1 className="text-2xl font-bold mb-6">
                  <span className="text-[#E94E77]">
                    {formatArticleNumber(articleData.article)}{' '}
                  </span>
                  <span className="text-gray-800">
                    {articleData.titleOsaka || articleData.title}
                  </span>
                </h1>
              }
            />
          </header>

          <div className="max-w-4xl mx-auto">
            {/* ナビゲーション */}
            <div className="mb-8 select-none">
              <ArticleNavigation
                lawCategory={lawCategory}
                law={law}
                currentArticle={articleData.article}
                lawName={lawName}
                allArticles={allArticles}
              />
            </div>

            {/* 条文表示 */}
            <div
              className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-8 mb-8 relative cursor-pointer select-none"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('button')) return;
                toggleViewMode();
              }}
              title="クリックまたはスペースキーで表示を切り替え"
            >
              <AnimatedContent
                showOsaka={showOsaka}
                originalContent={
                  <div className="text-lg leading-relaxed">
                    <div className="text-gray-800">
                      {articleData.originalText.map((paragraph, index) => (
                        <p
                          key={index}
                          className="mb-3"
                          dangerouslySetInnerHTML={{ __html: paragraph }}
                        />
                      ))}
                    </div>
                  </div>
                }
                osakaContent={
                  <div className="text-lg leading-relaxed">
                    <div className="text-gray-800" style={{ color: 'var(--primary-color)' }}>
                      {articleData.osakaText.map((paragraph, index) => (
                        <p key={index} className="mb-3">
                          {highlightKeywords(paragraph)}
                        </p>
                      ))}
                    </div>
                  </div>
                }
              />

              <div className="absolute bottom-4 right-4 z-10">
                <SpeakerButton
                  text={
                    showOsaka
                      ? articleData.osakaText.join('\n\n')
                      : articleData.originalText.join('\n\n')
                  }
                  voice={showOsaka ? 'female' : 'male'}
                />
              </div>
            </div>

            {/* 解説 */}
            <div
              className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-6 border-2 border-red-400 relative cursor-pointer select-none"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('button')) return;
                toggleViewMode();
              }}
              title="クリックまたはスペースキーで表示を切り替え"
            >
              <div className="absolute -top-4 left-6 bg-red-500 rounded-full w-8 h-8 flex items-center justify-center">
                <LightBulbIcon />
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center">
                  <ChatBubbleIcon className="mr-2" />
                  ワンポイント解説
                </h3>
                <AnimatedContent
                  showOsaka={showOsaka}
                  originalContent={
                    <div className="leading-relaxed">
                      <div className="text-gray-700">
                        {articleData.commentary.map((paragraph, index) => (
                          <p key={index} className="mb-3">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  }
                  osakaContent={
                    <div className="leading-relaxed">
                      <div className="text-gray-700" style={{ color: 'var(--primary-color)' }}>
                        {(articleData.commentaryOsaka || articleData.commentary).map(
                          (paragraph, index) => (
                            <p key={index} className="mb-3">
                              {highlightKeywords(paragraph)}
                            </p>
                          )
                        )}
                      </div>
                    </div>
                  }
                />
              </div>

              <div className="absolute bottom-4 right-4 z-10">
                <SpeakerButton
                  text={
                    showOsaka
                      ? (articleData.commentaryOsaka || articleData.commentary).join('\n\n')
                      : articleData.commentary.join('\n\n')
                  }
                  voice={showOsaka ? 'female' : 'male'}
                />
              </div>
            </div>

            {/* 操作説明 */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-2">簡単操作</p>
              <div className="flex flex-col items-center gap-1 text-xs text-gray-400">
                <span>🖱️ クリック、⌨️ スペースキー：言語の切り替え</span>
                <span>📱 スワイプ、⌨️ ← → キー：前後の条文へ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
