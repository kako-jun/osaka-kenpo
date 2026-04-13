'use client';

import { useEffect, useState, useRef } from 'react';
import { NOSTALGIC_COUNTER_API_BASE, getNostalgicId } from '@/lib/eeyan';
import { logger } from '@/lib/logger';

interface ArticleViewCounterProps {
  articleId: string;
  lawCategory: string;
  law: string;
}

/** sessionStorage の安全なラッパー */
function safeSessionGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSessionSet(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // ストレージ制限環境では無視
  }
}

const CACHE_DURATION = 5 * 60 * 1000; // 5分

/**
 * 条文ページの閲覧数カウンター
 * - ページ表示時にセッション内で1回だけインクリメント
 * - 閲覧数を控えめに表示
 */
export function ArticleViewCounter({ articleId, lawCategory, law }: ArticleViewCounterProps) {
  const [count, setCount] = useState<number | null>(null);
  const hasIncremented = useRef(false);

  const counterId = getNostalgicId(lawCategory, law, articleId);

  useEffect(() => {
    const fetchAndIncrement = async () => {
      try {
        // セッション内で一度だけインクリメント（重複防止）
        const sessionKey = `counter_incremented_${counterId}`;
        const alreadyIncremented = safeSessionGet(sessionKey);

        if (!alreadyIncremented && !hasIncremented.current) {
          const incrementUrl = `${NOSTALGIC_COUNTER_API_BASE}?action=increment&id=${encodeURIComponent(counterId)}`;
          await fetch(incrementUrl);
          safeSessionSet(sessionKey, 'true');
          hasIncremented.current = true;
        }

        // キャッシュチェック
        const cacheKey = `counter_value_${counterId}`;
        const cacheTimeKey = `${cacheKey}_time`;
        const cached = safeSessionGet(cacheKey);
        const cachedTime = safeSessionGet(cacheTimeKey);

        if (cached && cachedTime && Date.now() - parseInt(cachedTime) < CACHE_DURATION) {
          setCount(parseInt(cached));
        } else {
          const displayUrl = `${NOSTALGIC_COUNTER_API_BASE}?action=get&id=${encodeURIComponent(counterId)}&format=json`;
          const response = await fetch(displayUrl);
          const data = (await response.json()) as { success: boolean; data: { total: number } };
          if (data.success) {
            setCount(data.data.total);
            safeSessionSet(cacheKey, String(data.data.total));
            safeSessionSet(cacheTimeKey, String(Date.now()));
          }
        }
      } catch (error) {
        logger.error('Failed to fetch view counter', error, { counterId });
        // エラー時は表示しない（null のまま）
      }
    };

    fetchAndIncrement();
  }, [counterId]);

  if (count === null) {
    return null;
  }

  return (
    <span className="flex items-center gap-1 text-xs text-gray-400" title={`${count} 閲覧`}>
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
      <span>{count.toLocaleString()}</span>
    </span>
  );
}
