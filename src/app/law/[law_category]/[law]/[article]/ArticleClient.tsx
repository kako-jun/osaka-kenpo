'use client';

import { useState, useEffect } from 'react';
import { useViewMode } from '@/app/context/ViewModeContext';
import { safeSessionGet, getPageStorageKey } from '@/lib/storage';
import { ArticleNavigation } from '@/app/components/ArticleNavigation';
import { ScrollAwareBackLink } from '@/app/components/navigation/ScrollAwareBackLink';
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

  // sessionStorage からページ番号を読み取り、戻りリンクに反映
  const basePath = `/law/${lawCategory}/${law}`;
  const [backHref, setBackHref] = useState(basePath);
  useEffect(() => {
    const savedPage = safeSessionGet(getPageStorageKey(lawCategory, law));
    const parsed = parseInt(savedPage ?? '', 10);
    if (parsed > 1) {
      setBackHref(`${basePath}?page=${parsed}`);
    }
  }, [basePath, lawCategory, law]);

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
    <div className="bg-cream relative">
      {/* 左上に戻るリンク */}
      <div className="fixed top-20 left-4 z-10">
        <ScrollAwareBackLink href={backHref}>条文一覧へ</ScrollAwareBackLink>
      </div>

      <ArticleNavigationButtons
        prevArticle={prevArticle}
        nextArticle={nextArticle}
        onNavigate={navigateToArticle}
      />

      <div id="page-content">
        <div className="container mx-auto px-4 py-8">
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
    </div>
  );
}
