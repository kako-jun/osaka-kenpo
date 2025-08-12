'use client'

import { useState } from 'react'

interface ShareButtonProps {
  title: string
  url?: string
}

export const ShareButton = ({ title, url }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareCount, setShareCount] = useState(0)
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  // HTMLタグを除去してプレーンテキストにする
  const cleanTitle = title.replace(/<[^>]*>/g, '')
  const shareText = `${cleanTitle} - おおさかけんぽう`

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentUrl)
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
          setIsOpen(false)
        }, 1500)
      } else {
        // フォールバック: 古いブラウザや制限のある環境用
        const textArea = document.createElement('textarea')
        textArea.value = currentUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        textArea.setSelectionRange(0, 99999)
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (successful) {
          setCopied(true)
          setTimeout(() => {
            setCopied(false)
            setIsOpen(false)
          }, 1500)
        } else {
          console.error('コピーに失敗しました')
          setIsOpen(false)
        }
      }
    } catch (err) {
      console.error('コピーに失敗しました:', err)
      // エラーでも少し待ってから閉じる
      setTimeout(() => {
        setIsOpen(false)
      }, 500)
    }
  }

  const handleShareX = () => {
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`
    window.open(xUrl, '_blank', 'width=600,height=400')
    setShareCount(prev => prev + 1)
    setIsOpen(false)
  }

  const handleShareNote = () => {
    const noteUrl = `https://note.com/intent/post?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`
    window.open(noteUrl, '_blank', 'width=600,height=400')
    setShareCount(prev => prev + 1)
    setIsOpen(false)
  }

  const handleShareHatena = () => {
    const hatenaUrl = `https://b.hatena.ne.jp/entry/panel/?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shareText)}`
    window.open(hatenaUrl, '_blank', 'width=600,height=400')
    setShareCount(prev => prev + 1)
    setIsOpen(false)
  }

  const handleShareLine = () => {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`
    window.open(lineUrl, '_blank', 'width=600,height=400')
    setShareCount(prev => prev + 1)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#E94E77] hover:bg-[#d63d6b] text-white px-3 py-2 rounded-full shadow-lg transition-colors flex items-center space-x-2 border-2 border-[#E94E77]"
        title="広めたる"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
        <span className="font-medium text-sm">
          広めたる
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 bg-white rounded-lg shadow-xl border border-gray-200 z-50 min-w-[200px]">
            <div className="p-4 border-b border-gray-200" style={{ backgroundColor: '#FFF8DC' }}>
              <div className="font-medium" style={{ color: '#8B4513' }}>広めたる</div>
            </div>
            <div className="p-2">
            
            <button
              onClick={handleShareX}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X
            </button>

            <button
              onClick={handleShareNote}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 512 512">
                <path d="M256 32C132.288 32 32 132.288 32 256s100.288 224 224 224 224-100.288 224-224S379.712 32 256 32zm97.28 327.104c-11.264 16.576-26.624 28.736-46.976 36.224-20.48 7.552-43.392 11.392-68.608 11.392-17.984 0-35.264-2.624-51.712-7.808-16.448-5.248-30.848-12.8-43.136-22.592-12.352-9.856-21.952-21.952-28.8-36.224-6.848-14.272-10.304-30.336-10.304-48.128 0-21.312 4.352-39.936 13.056-55.872 8.704-15.936 20.992-28.736 36.864-38.4 15.872-9.664 34.304-14.528 55.296-14.528 18.624 0 34.944 3.712 48.896 11.136 13.952 7.424 24.896 17.984 32.832 31.616 7.936 13.632 11.904 29.312 11.904 47.04 0 14.528-2.624 27.52-7.808 39.04-5.184 11.52-12.288 21.632-21.312 30.336-9.024 8.704-19.264 15.424-30.656 20.096-11.392 4.672-23.424 7.04-36.096 7.04-7.552 0-14.208-1.024-19.968-3.072-5.76-2.048-10.304-5.056-13.632-9.024l-1.92 9.024h-11.392V179.2h12.8v62.464c3.072-4.352 7.168-7.744 12.288-10.24 5.12-2.496 11.136-3.776 18.048-3.776 9.024 0 17.152 1.856 24.384 5.504 7.232 3.648 13.376 8.768 18.432 15.36 5.056 6.592 8.96 14.464 11.712 23.616 2.752 9.152 4.128 19.2 4.128 30.144 0 11.264-1.536 21.632-4.608 31.104-3.072 9.472-7.424 17.664-13.056 24.576z"/>
              </svg>
              note
            </button>

            <button
              onClick={handleShareHatena}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 1000 1000">
                <path d="M500 0C223.6 0 0 223.6 0 500s223.6 500 500 500 500-223.6 500-500S776.4 0 500 0zm-54.7 764.4c-33.7 0-63.5-14.6-63.5-48.5 0-34.3 29.8-48.5 63.5-48.5 34 0 63.5 14.2 63.5 48.5 0 34-29.5 48.5-63.5 48.5zm319.2-40.2c0 15.6-12.5 28.1-28.1 28.1H597.5c-15.6 0-28.1-12.5-28.1-28.1v-50c0-15.6 12.5-28.1 28.1-28.1h21.9v-128c0-28.1-22.9-46.8-46.8-46.8h-37.5c-15.6 0-28.1-12.5-28.1-28.1v-50c0-15.6 12.5-28.1 28.1-28.1h53.1c59.4 0 109.4 50 109.4 109.4v143.7h21.9c15.6 0 28.1 12.5 28.1 28.1v50z"/>
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
          </div>
        </>
      )}
    </div>
  )
}