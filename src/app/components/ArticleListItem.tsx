import Link from 'next/link';
import { formatArticleNumber } from '@/lib/utils';

interface ArticleListItemProps {
  article: string | number;
  title: string;
  href: string;
  famousArticleBadge?: string | null;
}

export function ArticleListItem({
  article,
  title,
  href,
  famousArticleBadge,
}: ArticleListItemProps) {
  return (
    <Link href={href}>
      <div className="block p-6 bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-shadow cursor-pointer border-l-4 border-[#E94E77] mb-4 relative">
        <div className="flex flex-col sm:flex-row sm:items-center">
          <span className="font-bold text-[#E94E77] text-lg mb-2 sm:mb-0 sm:mr-4">
            {formatArticleNumber(article)}
          </span>
          {title && title.trim() !== '' && (
            <div className="text-gray-800 text-base leading-relaxed">
              <span dangerouslySetInnerHTML={{ __html: title }} />
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
}
