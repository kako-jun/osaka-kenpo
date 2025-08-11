'use client'

import { useState } from 'react'

interface LikeButtonProps {
  articleId?: string
  lawCategory?: string
  law?: string
}

export const LikeButton = ({ articleId, lawCategory, law }: LikeButtonProps) => {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleLike = async (e: React.MouseEvent) => {
    // モバイルでのhover状態をリセット
    e.currentTarget.blur()
    
    // アニメーション効果
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    if (liked) {
      setLiked(false)
      setLikeCount(prev => Math.max(0, prev - 1))
    } else {
      setLiked(true)
      setLikeCount(prev => prev + 1)
    }

    // TODO: 実際のAPI呼び出しはここに実装
    // try {
    //   await fetch('/api/like', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ articleId, lawCategory, law, liked: !liked })
    //   })
    // } catch (error) {
    //   console.error('Failed to update like:', error)
    // }
  }

  return (
    <button
      onClick={handleLike}
      style={{
        backgroundColor: liked ? '#E94E77' : 'white',
        color: liked ? 'white' : '#E94E77',
        borderColor: '#E94E77'
      }}
      className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 shadow-lg border-2 hover:shadow-md active:scale-95 ${
        isAnimating ? 'scale-110' : 'scale-100'
      }`}
      title={liked ? 'ええやん取り消し' : 'ええやん！'}
    >
      <span className="font-medium text-sm">
        ええやん
      </span>
      <span className="text-sm font-bold">
        {likeCount}
      </span>
    </button>
  )
}