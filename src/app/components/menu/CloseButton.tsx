interface CloseButtonProps {
  onClick: () => void;
}

export function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <>
      {/* メニュー上部の横長クリックエリア */}
      <div
        className="absolute top-0 left-0 w-full h-16 z-40 cursor-pointer"
        onClick={onClick}
        aria-label="メニューを閉じる"
      ></div>

      <button
        onClick={onClick}
        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors z-40"
        aria-label="メニューを閉じる"
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </>
  );
}
