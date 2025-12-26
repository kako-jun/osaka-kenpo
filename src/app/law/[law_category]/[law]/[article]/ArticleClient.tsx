'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SpeakerButton } from '@/components/SpeakerButton';
import { ShareButton } from '@/app/components/ShareButton';
import { LikeButton } from '@/app/components/LikeButton';
import { ArticleNavigation } from '@/app/components/ArticleNavigation';
import { AnimatedContent } from '@/app/components/AnimatedContent';
import { highlightKeywords } from '@/lib/text_highlight';

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
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'osaka' | 'original'>('osaka');

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

  const navigateToArticle = (articleId: string | number) => {
    router.push(`/law/${lawCategory}/${law}/${articleId}`);
  };

  // キーボードショートカットとスワイプジェスチャー
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        (event.target as HTMLElement)?.tagName
      );

      if (!isInputFocused) {
        if (event.code === 'Space') {
          event.preventDefault();
          toggleViewMode();
        } else if (event.code === 'ArrowLeft' && prevArticle) {
          event.preventDefault();
          navigateToArticle(prevArticle);
        } else if (event.code === 'ArrowRight' && nextArticle) {
          event.preventDefault();
          navigateToArticle(nextArticle);
        }
      }
    };

    // スワイプジェスチャー
    let touchStartX = 0;
    let touchStartY = 0;
    let isTracking = false;
    let isHorizontalSwipe = false;

    const handleTouchStart = (event: TouchEvent) => {
      touchStartX = event.changedTouches[0].screenX;
      touchStartY = event.changedTouches[0].screenY;
      isTracking = true;
      isHorizontalSwipe = false;

      const pageContent = document.getElementById('page-content') as HTMLElement | null;
      if (pageContent) {
        pageContent.style.transition = 'none';
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isTracking) return;

      const touchCurrentX = event.changedTouches[0].screenX;
      const touchCurrentY = event.changedTouches[0].screenY;
      const currentDistanceX = touchCurrentX - touchStartX;
      const currentDistanceY = touchCurrentY - touchStartY;

      const absX = Math.abs(currentDistanceX);
      const absY = Math.abs(currentDistanceY);

      if (absX > 20 || absY > 20) {
        if (absY > absX * 1.5) {
          isHorizontalSwipe = false;
        } else if (absX > absY) {
          isHorizontalSwipe = true;
        }
      }

      if (isHorizontalSwipe) {
        const progress = Math.min(Math.abs(currentDistanceX) / 150, 1);
        const scale = 1 - progress * 0.05;

        const pageContent = document.getElementById('page-content') as HTMLElement | null;
        if (pageContent) {
          pageContent.style.transform = `scale(${scale})`;
          pageContent.style.opacity = String(1 - progress * 0.3);
        }
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!isTracking) return;

      const touchEndX = event.changedTouches[0].screenX;
      const touchEndY = event.changedTouches[0].screenY;
      isTracking = false;

      const swipeDistanceX = touchEndX - touchStartX;
      const swipeDistanceY = touchEndY - touchStartY;
      const swipeThreshold = 150;

      const pageContent = document.getElementById('page-content') as HTMLElement | null;
      if (pageContent) {
        pageContent.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        pageContent.style.transform = 'scale(1)';
        pageContent.style.opacity = '1';

        setTimeout(() => {
          pageContent.style.transition = '';
          pageContent.style.transform = '';
          pageContent.style.opacity = '';
        }, 300);
      }

      const absX = Math.abs(swipeDistanceX);
      const absY = Math.abs(swipeDistanceY);

      if (isHorizontalSwipe && absX > swipeThreshold && absX > absY * 1.5) {
        if (swipeDistanceX > 0 && prevArticle) {
          navigateToArticle(prevArticle);
        } else if (swipeDistanceX < 0 && nextArticle) {
          navigateToArticle(nextArticle);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [viewMode, prevArticle, nextArticle]);

  // 条文番号フォーマット
  const formatArticleNumber = (article: string | number) => {
    if (typeof article === 'number') return `第${article}条`;
    if (String(article).startsWith('fusoku_')) {
      return `附則第${String(article).replace('fusoku_', '')}条`;
    }
    return `第${article}条`;
  };

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
          <svg
            width="24"
            height="60"
            viewBox="0 0 24 60"
            fill="currentColor"
            className="relative z-10"
          >
            <path
              d="M20 10 L8 30 L20 50"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
          <svg
            width="24"
            height="60"
            viewBox="0 0 24 60"
            fill="currentColor"
            className="relative z-10"
          >
            <path
              d="M4 10 L16 30 L4 50"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 21C9 21.5523 9.44772 22 10 22H14C14.5523 22 15 21.5523 15 21V20H9V21Z"
                    fill="#9CA3AF"
                  />
                  <path
                    d="M12 2C8.13401 2 5 5.13401 5 9C5 11.3869 6.33193 13.4617 8.27344 14.5547C8.27344 14.5547 9 15.5 9 17H15C15 15.5 15.7266 14.5547 15.7266 14.5547C17.6681 13.4617 19 11.3869 19 9C19 5.13401 15.866 2 12 2Z"
                    fill="#FCD34D"
                  />
                  <path d="M9 18H15V19H9V18Z" fill="#9CA3AF" />
                </svg>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center">
                  <svg
                    className="mr-2"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 12h.01M12 12h.01M16 12h.01M3 12c0 4.418 4.03 8 9 8a9.863 9.863 0 004.255-.949L21 20l-1.395-3.72C20.488 15.042 21 13.574 21 12c0-4.418-4.03-8-9-8s-9 3.582-9 8z"
                      stroke="#DC2626"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
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
