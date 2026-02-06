interface HamburgerButtonProps {
  onClick: () => void;
}

export function HamburgerButton({ onClick }: HamburgerButtonProps) {
  return (
    <button
      onClick={onClick}
      className="absolute top-1/2 left-4 -translate-y-1/2 z-30 p-2 rounded-lg hover:bg-white/20 transition-colors"
      aria-label="メニューを開く"
    >
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
    </button>
  );
}
