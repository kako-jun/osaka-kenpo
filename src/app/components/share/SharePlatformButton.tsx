import type { SharePlatform } from './sharePlatforms';

interface SharePlatformButtonProps {
  platform: SharePlatform;
  onClick: (platform: SharePlatform) => void;
}

export function SharePlatformButton({ platform, onClick }: SharePlatformButtonProps) {
  return (
    <button
      onClick={() => onClick(platform)}
      className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
    >
      <div
        className={`w-4 h-4 mr-2 ${platform.bg} ${platform.rounded} flex items-center justify-center`}
      >
        <span className="text-white text-xs font-bold">{platform.icon}</span>
      </div>
      <span className="text-gray-700">{platform.label}</span>
    </button>
  );
}
