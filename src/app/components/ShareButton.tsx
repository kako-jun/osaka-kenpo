'use client'

import { useState } from 'react'

interface ShareButtonProps {
  title?: string
  url?: string
}

export const ShareButton = ({ title, url }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareCount, setShareCount] = useState(0)
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  // ブラウザのタイトルを取得、フォールバックでpropsを使用
  const browserTitle = typeof document !== 'undefined' ? document.title : ''
  const effectiveTitle = title || browserTitle
  const cleanTitle = effectiveTitle.replace(/<[^>]*>/g, '')
  const shareText = cleanTitle

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

  const handleShareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareText)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
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
              className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
            >
              <div className="w-4 h-4 mr-2 bg-black rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">𝕏</span>
              </div>
              <span className="text-gray-700">X</span>
            </button>

            <button
              onClick={handleShareNote}
              className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
            >
              <div className="w-4 h-4 mr-2 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">n</span>
              </div>
              <span className="text-gray-700">note</span>
            </button>

            <button
              onClick={handleShareHatena}
              className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
            >
              <div className="w-4 h-4 mr-2 bg-[#00A4DE] rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">B!</span>
              </div>
              <span className="text-gray-700">はてブ</span>
            </button>

            <button
              onClick={handleShareLine}
              className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
            >
              <div className="w-4 h-4 mr-2 bg-[#06C755] rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">L</span>
              </div>
              <span className="text-gray-700">LINE</span>
            </button>

            <button
              onClick={handleShareFacebook}
              className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
            >
              <div className="w-4 h-4 mr-2 bg-[#1877F2] rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">f</span>
              </div>
              <span className="text-gray-700">Facebook</span>
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