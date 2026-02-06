import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { formatArticleNumber } from '@/lib/utils';

interface ArticleNavigationButtonsProps {
  prevArticle: string | number | null;
  nextArticle: string | number | null;
  onNavigate: (article: string | number) => void;
}

export function ArticleNavigationButtons({
  prevArticle,
  nextArticle,
  onNavigate,
}: ArticleNavigationButtonsProps) {
  return (
    <>
      {/* 前の条文への矢印 */}
      {prevArticle && (
        <button
          onClick={() => onNavigate(prevArticle)}
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
          onClick={() => onNavigate(nextArticle)}
          className="fixed right-0 top-32 bottom-32 w-8 z-[1] text-gray-300 hover:text-[#E94E77] transition-all flex items-center justify-center group"
          title={`${formatArticleNumber(nextArticle)}へ`}
          style={{ background: 'transparent' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-80 transition-opacity"></div>
          <ChevronRightIcon className="relative z-10" />
        </button>
      )}
    </>
  );
}
