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
      <div className="w-4 h-4 mr-2 flex items-center justify-center overflow-hidden">
        {platform.iconImage ? (
          <img src={platform.iconImage} alt={platform.label} className="w-4 h-4" />
        ) : BrandIcon ? (
          <BrandIcon />
        ) : null}
      </div>
      <span className="text-gray-700">{platform.label}</span>
    </button>
  );
});
