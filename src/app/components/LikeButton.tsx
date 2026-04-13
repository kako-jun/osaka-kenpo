'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  NOSTALGIC_API_BASE,
  getOrCreateEeyanUserId,
  getEeyanUserId,
  getNostalgicId,
} from '@/lib/eeyan';
import { useNotifyEeyanChanged } from '@/app/context/EeyanContext';
import { safeSessionRemove } from '@/lib/storage';

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
  const isTogglingRef = useRef(false);

  const notifyEeyanChanged = useNotifyEeyanChanged();

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
      // 連打ガード: 前回のトグルが完了するまで新しいトグルを受け付けない
      if (isTogglingRef.current) return;
      isTogglingRef.current = true;

      try {
        // モバイルでのhover状態をリセット
        (e.currentTarget as HTMLElement).blur();

        // アニメーション
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);

        // 楽観的更新（失敗時に戻すため旧値を保持）
        const prevLiked = liked;
        const newLiked = !liked;
        setLiked(newLiked);
        setLikeCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));

        // ユーザーID取得（初回クリック時に生成）
        const userId = getOrCreateEeyanUserId();

        const toggleNostalgic = () =>
          fetch(`${NOSTALGIC_API_BASE}?action=toggle&id=${nostalgicId}`)
            .then((res) => res.ok)
            .catch(() => false);

        const toggleD1 = () =>
          fetch('/api/eeyan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              category: lawCategory,
              lawName: law,
              article: articleId,
            }),
          })
            .then((res) => res.ok)
            .catch(() => false);

        // nostalgic toggle + D1 toggle を並行実行し、個別に結果を追跡
        let [nostalgicOk, d1Ok] = await Promise.all([toggleNostalgic(), toggleD1()]);

        // 片方でも失敗した場合: 失敗した方を1回リトライ
        if (!nostalgicOk || !d1Ok) {
          const retries: Promise<boolean>[] = [];
          if (!nostalgicOk) retries.push(toggleNostalgic());
          if (!d1Ok) retries.push(toggleD1());
          const retryResults = await Promise.all(retries);

          let idx = 0;
          if (!nostalgicOk) nostalgicOk = retryResults[idx++];
          if (!d1Ok) d1Ok = retryResults[idx];
        }

        if (nostalgicOk && d1Ok) {
          // 両方成功: キャッシュ無効化 + 同期通知
          const cacheKey = `eeyan_total_${lawCategory}_${law}`;
          safeSessionRemove(cacheKey);
          safeSessionRemove(`${cacheKey}_time`);
          notifyEeyanChanged();
          return;
        }

        // リトライ後も失敗: UIを元に戻す
        setLiked(prevLiked);
        setLikeCount((prev) => (prevLiked ? prev + 1 : Math.max(0, prev - 1)));

        // 成功した側をロールバック（再toggle）して整合性を保つ
        if (nostalgicOk) toggleNostalgic().catch(() => {});
        if (d1Ok) toggleD1().catch(() => {});
      } finally {
        isTogglingRef.current = false;
      }
    },
    [nostalgicId, liked, lawCategory, law, articleId, notifyEeyanChanged]
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
