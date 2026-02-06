'use client';

import { useState } from 'react';
import { platforms, type SharePlatform } from './share/sharePlatforms';
import { ShareIcon, CheckIcon, ClipboardIcon } from './share/ShareIcons';
import { useCopyToClipboard } from './share/useCopyToClipboard';
import { SharePlatformButton } from './share/SharePlatformButton';

interface ShareButtonProps {
  title?: string;
  url?: string;
  popupDirection?: 'up' | 'down';
}

export const ShareButton = ({ title, url, popupDirection = 'down' }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { copied, copyToClipboard } = useCopyToClipboard();

  // URLを取得し、トップページの場合は末尾スラッシュを削除
  const rawUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const currentUrl =
    rawUrl.endsWith('/') && new URL(rawUrl).pathname === '/' ? rawUrl.slice(0, -1) : rawUrl;

  // ブラウザのタイトルを取得、フォールバックでpropsを使用
  const browserTitle = typeof document !== 'undefined' ? document.title : '';
  const effectiveTitle = title || browserTitle;
  const cleanTitle = effectiveTitle.replace(/<[^>]*>/g, '');
  const shareText = cleanTitle;

  const handleCopyLink = async () => {
    const success = await copyToClipboard(currentUrl);
    if (success) {
      setTimeout(() => setIsOpen(false), 1500);
    } else {
      setTimeout(() => setIsOpen(false), 500);
    }
  };

  const handleSharePlatform = (platform: SharePlatform) => {
    const shareUrl = platform.getUrl(shareText, currentUrl);
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#E94E77] hover:bg-[#d63d6b] text-white px-3 py-2 rounded-full shadow-lg transition-colors flex items-center space-x-2 border-2 border-[#E94E77]"
        title="広めたる"
      >
        <ShareIcon />
        <span className="font-medium text-sm">広めたる</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute right-0 ${popupDirection === 'up' ? 'bottom-12' : 'top-12'} bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[200px]`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200" style={{ backgroundColor: '#FFF8DC' }}>
              <div className="font-medium" style={{ color: '#8B4513' }}>
                広めたる
              </div>
            </div>
            <div className="p-2">
              {platforms.map((platform) => (
                <SharePlatformButton
                  key={platform.id}
                  platform={platform}
                  onClick={handleSharePlatform}
                />
              ))}

              <hr className="my-2" />

              <button
                onClick={handleCopyLink}
                className={`flex items-center w-full px-3 py-2 text-sm rounded transition-colors ${
                  copied ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {copied ? <CheckIcon /> : <ClipboardIcon />}
                {copied ? 'コピー済み!' : 'リンクをコピー'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
