'use client';

import { useViewMode } from '@/app/context/ViewModeContext';
import { ArticleNavigation } from '@/app/components/ArticleNavigation';
import { BackToListLink } from '@/app/components/navigation/BackToListLink';
import { useArticleNavigation } from '@/hooks/useArticleNavigation';
import { ArticleNavigationButtons } from './components/ArticleNavigationButtons';
import { ArticleHeader } from './components/ArticleHeader';
import { ArticleTextSection } from './components/ArticleTextSection';
import { CommentarySection } from './components/CommentarySection';
import { OperationHint } from './components/OperationHint';

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
      <ArticleNavigationButtons
        prevArticle={prevArticle}
        nextArticle={nextArticle}
        onNavigate={navigateToArticle}
      />

      <div id="page-content">
        <div className="container mx-auto px-4 pt-4 pb-8">
          {/* 条文一覧への戻るリンク */}
          <div className="mb-2">
            <BackToListLink lawCategory={lawCategory} law={law} className="px-3 py-2" />
          </div>

          <ArticleHeader
            article={articleData.article}
            title={articleData.title}
            titleOsaka={articleData.titleOsaka}
            showOsaka={showOsaka}
          />

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

            <ArticleTextSection
              originalText={articleData.originalText}
              osakaText={articleData.osakaText}
              showOsaka={showOsaka}
              onToggleView={toggleViewMode}
            />

            <CommentarySection
              commentary={articleData.commentary}
              commentaryOsaka={articleData.commentaryOsaka}
              showOsaka={showOsaka}
              onToggleView={toggleViewMode}
              articleId={articleId}
              lawCategory={lawCategory}
              law={law}
            />

            <OperationHint />
          </div>
        </div>
      </div>
    </main>
  );
}
