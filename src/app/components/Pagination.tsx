import Link from 'next/link';

interface PageRange {
  start: number;
  end: number;
  label: string;
}

interface PaginationProps {
  basePath: string;
  pageRanges: PageRange[];
  currentPage: number;
  isSupplPage: boolean;
  hasSupplementary: boolean;
}

export function Pagination({
  basePath,
  pageRanges,
  currentPage,
  isSupplPage,
  hasSupplementary,
}: PaginationProps) {
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {pageRanges.map((range, index) => {
        const pageNum = index + 1;
        const isActive = !isSupplPage && currentPage === pageNum;
        return (
          <Link
            key={pageNum}
            href={`${basePath}${pageNum === 1 ? '' : `?page=${pageNum}`}`}
            className={`px-2 py-1.5 rounded text-xs font-medium transition-colors min-w-[5.5rem] text-center ${
              isActive
                ? 'bg-[#E94E77] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {range.label}
          </Link>
        );
      })}
      {hasSupplementary && (
        <Link
          href={`${basePath}?page=suppl`}
          className={`px-2 py-1.5 rounded text-xs font-medium transition-colors min-w-[5.5rem] text-center ${
            isSupplPage
              ? 'bg-[#E94E77] text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          附則
        </Link>
      )}
    </div>
  );
}

// ページ範囲を計算するユーティリティ関数
export function getPageRanges(totalArticles: number, articlesPerPage: number): PageRange[] {
  const ranges: PageRange[] = [];
  for (let i = 0; i < totalArticles; i += articlesPerPage) {
    const start = i + 1;
    const end = Math.min(i + articlesPerPage, totalArticles);
    ranges.push({ start, end, label: `${start}〜${end}条` });
  }
  return ranges;
}
