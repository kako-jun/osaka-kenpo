import Link from 'next/link';
import { formatArticleNumber } from '@/lib/utils';

interface ArticleListItemProps {
  article: string | number;
  title: string;
  href: string;
  famousArticleBadge?: string | null;
  isDeleted?: boolean;
  originalText?: string;
  likeCount?: number;
}

// 原文の冒頭を取得（50文字程度で省略）
function getExcerpt(text: string, maxLength: number = 50): string {
  if (!text) return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength) + '...';
}

export function ArticleListItem({
  article,
  title,
  href,
  famousArticleBadge,
  isDeleted,
  originalText,
  likeCount = 0,
}: ArticleListItemProps) {
  const hasTitle = title && title.trim() !== '';
  const excerpt = !hasTitle && originalText ? getExcerpt(originalText) : '';

  return (
    <Link href={href}>
      <div
        className={`block p-6 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-shadow cursor-pointer border-l-4 mb-4 relative ${
          isDeleted ? 'bg-gray-100 border-gray-400' : 'bg-white border-[#E94E77]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center">
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
              <span dangerouslySetInnerHTML={{ __html: title }} />
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
          <div className="absolute bottom-3 right-4 flex items-center text-xs text-[#E94E77]">
            <span>{likeCount} ええやん</span>
          </div>
        )}
      </div>
    </Link>
  );
}
