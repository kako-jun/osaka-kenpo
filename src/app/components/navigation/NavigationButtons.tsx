import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { formatArticleNumber } from '@/lib/utils';
import type { ArticleItem } from '@/hooks/useArticleList';

interface NavigationButtonsProps {
  lawCategory: string;
  law: string;
  prevArticle: ArticleItem | null;
  nextArticle: ArticleItem | null;
  currentArticle: string | number;
  currentIndex: number;
  totalArticles: number;
  onShowPopup: () => void;
  isMobile?: boolean;
}

export function NavigationButtons({
  lawCategory,
  law,
  prevArticle,
  nextArticle,
  currentArticle,
  currentIndex,
  totalArticles,
  onShowPopup,
  isMobile = false,
}: NavigationButtonsProps) {
  if (isMobile) {
    return (
      <div className="flex justify-between items-center">
        {prevArticle ? (
          <Link
            href={`/law/${lawCategory}/${law}/${prevArticle.article}`}
            className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors text-sm"
          >
            <ChevronLeftIcon className="w-3 h-3 mr-1" />前
          </Link>
        ) : (
          <div></div>
        )}

        <button
          onClick={onShowPopup}
          className="text-gray-500 font-medium hover:text-blue-600 px-2 py-1 text-sm"
        >
          {formatArticleNumber(currentArticle)} ({currentIndex + 1}/{totalArticles})
        </button>

        {nextArticle ? (
          <Link
            href={`/law/${lawCategory}/${law}/${nextArticle.article}`}
            className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors text-sm"
          >
            次<ChevronRightIcon className="w-3 h-3 ml-1" />
          </Link>
        ) : (
          <div></div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {prevArticle && (
        <Link
          href={`/law/${lawCategory}/${law}/${prevArticle.article}`}
          className="flex items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors whitespace-nowrap"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          {formatArticleNumber(prevArticle.article)}
        </Link>
      )}

      <div className="relative">
        <button
          onClick={onShowPopup}
          className="text-gray-500 font-medium hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors cursor-pointer"
        >
          {formatArticleNumber(currentArticle)} ({currentIndex + 1} / {totalArticles})
        </button>
      </div>

      {nextArticle && (
        <Link
          href={`/law/${lawCategory}/${law}/${nextArticle.article}`}
          className="flex items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors whitespace-nowrap"
        >
          {formatArticleNumber(nextArticle.article)}
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </Link>
      )}
    </div>
  );
}
