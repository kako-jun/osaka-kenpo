'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  NOSTALGIC_API_BASE,
  getOrCreateEeyanUserId,
  getEeyanUserId,
  getNostalgicId,
} from '@/lib/eeyan';

interface LikeButtonProps {
  articleId?: string;
  lawCategory?: string;
  law?: string;
}

export const LikeButton = ({ articleId, lawCategory, law }: LikeButtonProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const nostalgicId =
    articleId && lawCategory && law ? getNostalgicId(lawCategory, law, articleId) : null;

  // 初期状態取得
  useEffect(() => {
    if (!nostalgicId) {
      setIsLoading(false);
      return;
    }

    const fetchState = async () => {
      try {
        const promises: Promise<void>[] = [];

        // nostalgic: 全体カウント取得
        promises.push(
          fetch(`${NOSTALGIC_API_BASE}?action=get&id=${nostalgicId}&format=json`)
            .then((res) => res.json() as Promise<{ success: boolean; data: { total: number } }>)
            .then((data) => {
              if (data.success) {
                setLikeCount(data.data.total);
              }
            })
            .catch(() => {})
        );

        // osaka-kenpo: 個人状態取得
        const userId = getEeyanUserId();
        if (userId && lawCategory && law) {
          promises.push(
            fetch(`/api/eeyan?userId=${userId}&category=${lawCategory}&lawName=${law}`)
              .then((res) => res.json() as Promise<{ success: boolean; likes: string[] }>)
              .then((data) => {
                if (data.success && articleId) {
                  setLiked(data.likes.includes(articleId));
                }
              })
              .catch(() => {})
          );
        }

        await Promise.all(promises);
      } finally {
        setIsLoading(false);
      }
    };

    fetchState();
  }, [nostalgicId, articleId, lawCategory, law]);

  const handleLike = useCallback(
    async (e: React.MouseEvent) => {
      if (!nostalgicId || !lawCategory || !law || !articleId) return;

      // モバイルでのhover状態をリセット
      (e.currentTarget as HTMLElement).blur();

      // アニメーション
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);

      // 楽観的更新
      const newLiked = !liked;
      setLiked(newLiked);
      setLikeCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));

      // ユーザーID取得（初回クリック時に生成）
      const userId = getOrCreateEeyanUserId();

      // nostalgic toggle + osaka-kenpo toggle を並行実行
      const promises: Promise<unknown>[] = [
        fetch(`${NOSTALGIC_API_BASE}?action=toggle&id=${nostalgicId}`).catch(() => {}),
        fetch('/api/eeyan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            category: lawCategory,
            lawName: law,
            article: articleId,
          }),
        }).catch(() => {}),
      ];

      await Promise.all(promises);
    },
    [nostalgicId, liked, lawCategory, law, articleId]
  );

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      style={{
        backgroundColor: liked ? '#E94E77' : 'white',
        color: liked ? 'white' : '#E94E77',
        borderColor: '#E94E77',
      }}
      className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 shadow-lg border-2 hover:shadow-md active:scale-95 ${
        isAnimating ? 'scale-110' : 'scale-100'
      } ${isLoading ? 'opacity-50' : ''}`}
      title={liked ? 'ええやん取り消し' : 'ええやん！'}
    >
      <span className="font-medium text-sm">ええやん</span>
      <span className="text-sm font-bold">{likeCount}</span>
    </button>
  );
};
