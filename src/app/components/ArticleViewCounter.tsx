'use client';

import { useEffect, useState, useRef } from 'react';
import { NOSTALGIC_COUNTER_API_BASE, getNostalgicId } from '@/lib/eeyan';
import { logger } from '@/lib/logger';
import { safeSessionGet, safeSessionSet } from '@/lib/storage';
import { EyeIcon } from '@/components/icons';

interface ArticleViewCounterProps {
  articleId: string;
  lawCategory: string;
  law: string;
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

        const cacheKey = `counter_value_${counterId}`;
        const cacheTimeKey = `${cacheKey}_time`;
        let didIncrement = false;

        if (!alreadyIncremented && !hasIncremented.current) {
          const incrementUrl = `${NOSTALGIC_COUNTER_API_BASE}?action=increment&id=${encodeURIComponent(counterId)}`;
          await fetch(incrementUrl);
          safeSessionSet(sessionKey, 'true');
          hasIncremented.current = true;
          didIncrement = true;
        }

        // increment 直後はキャッシュを無視して最新値を取得
        const cached = safeSessionGet(cacheKey);
        const cachedTime = safeSessionGet(cacheTimeKey);

        if (
          !didIncrement &&
          cached &&
          cachedTime &&
          Date.now() - parseInt(cachedTime) < CACHE_DURATION
        ) {
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
      <EyeIcon />
      <span>{count.toLocaleString()}</span>
    </span>
  );
}
