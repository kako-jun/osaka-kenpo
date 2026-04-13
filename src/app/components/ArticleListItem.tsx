import Link from 'next/link';
import { EyeIcon } from '@/components/icons';
import { formatArticleNumber, getExcerpt } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';

interface ArticleListItemProps {
  article: string | number;
  title: string;
  href: string;
  famousArticleBadge?: string | null;
  isDeleted?: boolean;
  originalText?: string;
  likeCount?: number;
  viewCount?: number;
  isLiked?: boolean;
}

export function ArticleListItem({
  article,
  title,
  href,
  famousArticleBadge,
  isDeleted,
  originalText,
  likeCount = 0,
  viewCount,
  isLiked,
}: ArticleListItemProps) {
  const hasTitle = title && title.trim() !== '';
  const excerpt = !hasTitle && originalText ? getExcerpt(originalText) : '';

  const innerContent = (
    <div
      className={`block p-6 rounded-lg transition-shadow border-l-4 mb-4 relative ${
        isDeleted
          ? 'bg-gray-100 border-gray-400 cursor-default shadow-[0_0_15px_rgba(0,0,0,0.05)]'
          : 'bg-white border-[#E94E77] cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]'
      }`}
      {...(isDeleted
        ? { 'aria-disabled': true, 'aria-label': `${formatArticleNumber(article)} 削除済み` }
        : {})}
    >
      <div className="flex flex-col sm:flex-row sm:items-center pb-4">
        <span
          className={`font-bold text-lg mb-2 sm:mb-0 sm:mr-4 shrink-0 ${
            isDeleted ? 'text-gray-400' : 'text-[#E94E77]'
          }`}
        >
          {formatArticleNumber(article)}
        </span>
        {isDeleted ? (
          <div className="text-gray-400 text-base">（削除）</div>
        ) : hasTitle ? (
          <div className="text-gray-800 text-base leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(title) }} />
          </div>
        ) : excerpt ? (
          <div className="text-gray-400 text-sm leading-relaxed truncate italic">{excerpt}</div>
        ) : null}
      </div>

      {isDeleted && (
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white shadow-md bg-gray-400">
          削除
        </div>
      )}
      {!isDeleted && famousArticleBadge && (
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white shadow-md bg-slate-500">
          {famousArticleBadge}
        </div>
      )}
      {!isDeleted && (
        <div className="absolute bottom-3 right-4 flex items-center gap-3 text-xs">
          {viewCount !== undefined && (
            <span className="flex items-center gap-1 text-gray-400">
              <EyeIcon />
              <span>{viewCount.toLocaleString()}</span>
            </span>
          )}
          <span
            className={`flex items-center gap-1 ${isLiked ? 'text-[#E94E77]' : 'text-gray-400'}`}
          >
            <span>{likeCount} ええやん</span>
          </span>
        </div>
      )}
    </div>
  );

  if (isDeleted) {
    return innerContent;
  }

  return <Link href={href}>{innerContent}</Link>;
}
