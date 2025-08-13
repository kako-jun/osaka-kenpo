'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export const Loading = () => {
  const [messageIndex, setMessageIndex] = useState(0)

  const messages = [
    'ちょっと待っててな〜',
    '法律調べてるで〜',
    'もうちょっとやで〜',
    '頑張って探しとるわ〜',
    'すぐに見つかるで〜'
  ]

  useEffect(() => {
    // メッセージの切り替え（3秒ごと）
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, 3000)

    return () => {
      clearInterval(messageInterval)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      {/* 春日歩っぽいキャラクター風アイコン */}
      <div className="mb-6">
        <div className="w-16 h-16 bg-[#E94E77] rounded-full flex items-center justify-center animate-bounce">
          <Image 
            src="/po.webp" 
            alt="ぽう？" 
            width={32} 
            height={32}
            className="filter invert"
          />
        </div>
      </div>

      {/* メッセージ */}
      <div className="text-center space-y-2">
        <div className="text-lg font-bold text-[#E94E77] animate-pulse">
          {messages[messageIndex]}
        </div>
      </div>

      {/* 春日歩っぽい追加エフェクト */}
      <div className="flex space-x-2 mt-4">
        <div className="w-2 h-2 bg-[#E94E77] rounded-full animate-ping" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-[#E94E77] rounded-full animate-ping" style={{ animationDelay: '200ms' }}></div>
        <div className="w-2 h-2 bg-[#E94E77] rounded-full animate-ping" style={{ animationDelay: '400ms' }}></div>
      </div>

    </div>
  )
}