/**
 * 共通SVGアイコンコンポーネント
 */

interface IconProps {
  className?: string;
  width?: number;
  height?: number;
}

// 電球アイコン（ワンポイント解説用）
export const LightBulbIcon = ({ width = 16, height = 16 }: IconProps) => (
  <svg
    width={width}
    height={height}
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
);

// 吹き出しアイコン（コメント用）
export const ChatBubbleIcon = ({ className = '', width = 20, height = 20 }: IconProps) => (
  <svg
    className={className}
    width={width}
    height={height}
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
);

// 左矢印アイコン（前の条文へ）
export const ChevronLeftIcon = ({ className = '', width = 24, height = 60 }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 24 60" fill="currentColor" className={className}>
    <path
      d="M20 10 L8 30 L20 50"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 右矢印アイコン（次の条文へ）
export const ChevronRightIcon = ({ className = '', width = 24, height = 60 }: IconProps) => (
  <svg width={width} height={height} viewBox="0 0 24 60" fill="currentColor" className={className}>
    <path
      d="M4 10 L16 30 L4 50"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 目アイコン（閲覧数カウンター用）
export function EyeIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

export function ArrowLeftIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  );
}
