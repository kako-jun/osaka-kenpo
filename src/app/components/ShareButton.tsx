'use client';

import { useState } from 'react';
import { platforms, type SharePlatform } from './share/sharePlatforms';
import { ShareIcon, CheckIcon, ClipboardIcon } from './share/ShareIcons';
import { useCopyToClipboard } from './share/useCopyToClipboard';
import { SharePlatformButton } from './share/SharePlatformButton';
import { stripHtml } from '@/lib/utils';

export interface ArticleParams {
  category: string;
  law: string;
  article: string;
}

interface ShareButtonProps {
  title?: string;
  url?: string;
  popupDirection?: 'up' | 'down';
  articleParams?: ArticleParams;
}

type ShareMode = 'choose' | 'url' | 'image';

function ImageIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

function OpenInNewIcon() {
  return (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

export const ShareButton = ({
  title,
  url,
  popupDirection = 'down',
  articleParams,
}: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareMode, setShareMode] = useState<ShareMode>('choose');
  const { copied, copyToClipboard } = useCopyToClipboard();

  // URLを取得し、トップページの場合は末尾スラッシュを削除
  const rawUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const currentUrl =
    rawUrl.endsWith('/') && new URL(rawUrl).pathname === '/' ? rawUrl.slice(0, -1) : rawUrl;

  // ブラウザのタイトルを取得、フォールバックでpropsを使用
  const browserTitle = typeof document !== 'undefined' ? document.title : '';
  const effectiveTitle = title || browserTitle;
  const cleanTitle = stripHtml(effectiveTitle);
  const shareText = cleanTitle;

  const imageApiUrl = articleParams
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/api/article-image?category=${articleParams.category}&law=${articleParams.law}&article=${articleParams.article}`
    : '';

  const handleClose = () => {
    setIsOpen(false);
    setShareMode('choose');
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(currentUrl);
    if (success) {
      setTimeout(handleClose, 1500);
    } else {
      setTimeout(handleClose, 500);
    }
  };

  const handleSharePlatform = (platform: SharePlatform) => {
    const shareUrl = platform.getUrl(shareText, currentUrl);
    window.open(shareUrl, '_blank', 'width=600,height=400');
    handleClose();
  };

  const handleImageSharePlatform = (platform: SharePlatform) => {
    const text = `${shareText} (画像)`;
    const shareUrl = platform.getUrl(text, imageApiUrl);
    window.open(shareUrl, '_blank', 'width=600,height=400');
    handleClose();
  };

  const handleOpenImageInNewTab = () => {
    window.open(imageApiUrl, '_blank');
    handleClose();
  };

  const handleDownloadImage = async () => {
    try {
      const res = await fetch(imageApiUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${articleParams?.law}-${articleParams?.article}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // フォールバック: 直接開く
      window.open(imageApiUrl, '_blank');
    }
    handleClose();
  };

  // 条文ページでない場合はモード選択不要
  const hasImageMode = !!articleParams;

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (isOpen) {
            handleClose();
          } else {
            setIsOpen(true);
            setShareMode(hasImageMode ? 'choose' : 'url');
          }
        }}
        className="bg-[#E94E77] hover:bg-[#d63d6b] text-white px-3 py-2 rounded-full shadow-lg transition-colors flex items-center space-x-2 border-2 border-[#E94E77]"
        title="広めたる"
      >
        <ShareIcon />
        <span className="font-medium text-sm">広めたる</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          />
          <div
            className={`absolute right-0 ${popupDirection === 'up' ? 'bottom-12' : 'top-12'} bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[200px]`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* モード選択画面（条文ページのみ） */}
            {shareMode === 'choose' && (
              <>
                <div
                  className="p-4 border-b border-gray-200"
                  style={{ backgroundColor: '#FFF8DC' }}
                >
                  <div className="font-medium" style={{ color: '#8B4513' }}>
                    なにで広める？
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => setShareMode('url')}
                    className="flex items-center w-full px-3 py-3 text-sm hover:bg-gray-100 rounded transition-colors"
                  >
                    <div className="w-8 h-8 mr-3 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <LinkIcon />
                    </div>
                    <div className="text-left">
                      <div className="text-gray-800 font-medium">URLでシェア</div>
                      <div className="text-gray-500 text-xs">リンクをSNSに送る</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setShareMode('image')}
                    className="flex items-center w-full px-3 py-3 text-sm hover:bg-gray-100 rounded transition-colors"
                  >
                    <div className="w-8 h-8 mr-3 flex items-center justify-center rounded-full bg-pink-100 text-pink-600">
                      <ImageIcon />
                    </div>
                    <div className="text-left">
                      <div className="text-gray-800 font-medium">画像でシェア</div>
                      <div className="text-gray-500 text-xs">条文を画像にして送る</div>
                    </div>
                  </button>
                </div>
              </>
            )}

            {/* URLシェアモード（通常のSNSシェア） */}
            {shareMode === 'url' && (
              <>
                <div
                  className="p-4 border-b border-gray-200 flex items-center"
                  style={{ backgroundColor: '#FFF8DC' }}
                >
                  {hasImageMode && (
                    <button
                      onClick={() => setShareMode('choose')}
                      className="mr-2 text-gray-500 hover:text-gray-700"
                    >
                      <BackIcon />
                    </button>
                  )}
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
                    {copied ? 'コピーしました' : 'リンクをコピー'}
                  </button>
                </div>
              </>
            )}

            {/* 画像シェアモード */}
            {shareMode === 'image' && (
              <>
                <div
                  className="p-4 border-b border-gray-200 flex items-center"
                  style={{ backgroundColor: '#FFF8DC' }}
                >
                  <button
                    onClick={() => setShareMode('choose')}
                    className="mr-2 text-gray-500 hover:text-gray-700"
                  >
                    <BackIcon />
                  </button>
                  <div className="font-medium" style={{ color: '#8B4513' }}>
                    画像で広めたる
                  </div>
                </div>
                <div className="p-2">
                  {/* 画像を別タブで開くボタン */}
                  <button
                    onClick={handleOpenImageInNewTab}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    <OpenInNewIcon />
                    画像を別タブで開く
                  </button>

                  {/* 画像保存ボタン */}
                  <button
                    onClick={handleDownloadImage}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    <DownloadIcon />
                    画像を保存
                  </button>

                  <hr className="my-2" />

                  {/* SNSに画像URLをシェア */}
                  {platforms.map((platform) => (
                    <SharePlatformButton
                      key={platform.id}
                      platform={platform}
                      onClick={handleImageSharePlatform}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
