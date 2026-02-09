import { memo } from 'react';
import type { SharePlatform } from './sharePlatforms';
import { brandIcons } from './BrandIcons';

interface SharePlatformButtonProps {
  platform: SharePlatform;
  onClick: (platform: SharePlatform) => void;
}

export const SharePlatformButton = memo(function SharePlatformButton({
  platform,
  onClick,
}: SharePlatformButtonProps) {
  const BrandIcon = brandIcons[platform.id];

  return (
    <button
      onClick={() => onClick(platform)}
      className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
    >
      <div className="w-5 h-5 mr-3 flex items-center justify-center flex-shrink-0">
        <BrandIcon />
      </div>
      <span className="text-gray-700">{platform.label}</span>
    </button>
  );
});
