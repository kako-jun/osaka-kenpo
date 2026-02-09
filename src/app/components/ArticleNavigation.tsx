'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useArticleList, type ArticleItem } from '@/hooks/useArticleList';
import { ArticlePopup } from './navigation/ArticlePopup';
import { NavigationButtons } from './navigation/NavigationButtons';

interface ArticleNavigationProps {
  lawCategory: string;
  law: string;
  currentArticle: number | string;
  lawName: string;
  allArticles?: ArticleItem[];
}

export const ArticleNavigation = ({
  lawCategory,
  law,
  currentArticle,
  lawName,
  allArticles: propArticles,
}: ArticleNavigationProps) => {
  const router = useRouter();
  const articles = useArticleList(lawCategory, law, propArticles);
  const [showArticlePopup, setShowArticlePopup] = useState<boolean>(false);

  // 現在の条文のインデックスを取得
  const currentIndex = articles.findIndex(
    (article) => String(article.article) === String(currentArticle)
  );
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

  const handleArticleSelect = (articleId: string | number) => {
    setShowArticlePopup(false);
    router.push(`/law/${lawCategory}/${law}/${articleId}`);
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      {/* PC用レイアウト */}
      <div className="hidden sm:flex justify-center items-center">
        <div className="relative">
          <NavigationButtons
            lawCategory={lawCategory}
            law={law}
            prevArticle={prevArticle}
            nextArticle={nextArticle}
            currentArticle={currentArticle}
            currentIndex={currentIndex}
            totalArticles={articles.length}
            onShowPopup={() => setShowArticlePopup(true)}
          />
          {showArticlePopup && (
            <ArticlePopup
              articles={articles}
              currentArticle={currentArticle}
              onSelect={handleArticleSelect}
              onClose={() => setShowArticlePopup(false)}
            />
          )}
        </div>
      </div>

      {/* モバイル用レイアウト */}
      <div className="sm:hidden">
        <div className="relative">
          <NavigationButtons
            lawCategory={lawCategory}
            law={law}
            prevArticle={prevArticle}
            nextArticle={nextArticle}
            currentArticle={currentArticle}
            currentIndex={currentIndex}
            totalArticles={articles.length}
            onShowPopup={() => setShowArticlePopup(true)}
            isMobile
          />
          {showArticlePopup && (
            <ArticlePopup
              articles={articles}
              currentArticle={currentArticle}
              onSelect={handleArticleSelect}
              onClose={() => setShowArticlePopup(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
