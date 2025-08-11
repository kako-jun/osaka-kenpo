'use client'

import { useState } from 'react'

interface ShareButtonProps {
  title: string
  url?: string
}

export const ShareButton = ({ title, url }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  // HTMLタグを除去してプレーンテキストにする
  const cleanTitle = title.replace(/<[^>]*>/g, '')
  const shareText = `${cleanTitle} - おおさかけんぽう`

  const handleCopyLink = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(currentUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('コピーに失敗しました:', err)
      }
    }
    setIsOpen(false)
  }

  const handleShareX = () => {
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`
    window.open(xUrl, '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  const handleShareNote = () => {
    const noteUrl = `https://note.com/intent/post?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`
    window.open(noteUrl, '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  const handleShareHatena = () => {
    const hatenaUrl = `https://b.hatena.ne.jp/entry/panel/?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shareText)}`
    window.open(hatenaUrl, '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  const handleShareLine = () => {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`
    window.open(lineUrl, '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors"
        title="シェア"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 bg-white rounded-lg shadow-xl border z-50 p-2 min-w-[200px]">
            <div className="text-sm text-gray-600 mb-2 px-2">シェア</div>
            
            <button
              onClick={handleShareX}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X (Twitter)
            </button>

            <button
              onClick={handleShareNote}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.568 8.16c-.169 1.58-.896 4.728-1.688 6.64-.528 1.28-1.04 1.6-1.712 1.6-.656 0-1.112-.48-1.232-1.12-.088-.48-.12-1.112-.12-1.792V8.8c0-.64-.272-1.04-.816-1.04s-.96.4-.96 1.04v4.608c0 .88.08 1.6.248 2.24.32 1.2 1.2 1.872 2.32 1.872 1.36 0 2.288-.8 2.928-2.24.608-1.36 1.104-3.36 1.272-4.72.08-.656-.216-1.2-.88-1.2-.32 0-.52.16-.56.48z"/>
              </svg>
              note
            </button>

            <button
              onClick={handleShareHatena}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-2.678 18.338c-.809 0-1.525-.35-1.525-1.166 0-.825.716-1.166 1.525-1.166.816 0 1.525.341 1.525 1.166 0 .816-.709 1.166-1.525 1.166zm7.678-.966c0 .375-.3.675-.675.675h-3.3c-.375 0-.675-.3-.675-.675v-1.2c0-.375.3-.675.675-.675h.525v-3.075c0-.675-.55-1.125-1.125-1.125h-.9c-.375 0-.675-.3-.675-.675v-1.2c0-.375.3-.675.675-.675h1.275c1.425 0 2.625 1.2 2.625 2.625v3.45h.525c.375 0 .675.3.675.675v1.2z"/>
              </svg>
              はてブ
            </button>

            <button
              onClick={handleShareLine}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.629 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12.017.572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.592.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              LINE
            </button>

            <hr className="my-2" />

            <button
              onClick={handleCopyLink}
              className={`flex items-center w-full px-3 py-2 text-sm rounded transition-colors ${
                copied 
                  ? 'text-green-700 bg-green-50' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {copied ? (
                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
              {copied ? 'コピー済み!' : 'リンクをコピー'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}