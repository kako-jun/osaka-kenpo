'use client';

import { useEffect, useState, useRef } from 'react';
import { NOSTALGIC_COUNTER_API_BASE, getNostalgicId } from '@/lib/eeyan';
import { logger } from '@/lib/logger';
import { safeSessionGet, safeSessionSet } from '@/lib/storage';
import { EyeIcon } from '@/components/icons';
import { useNotifyEeyanChanged } from '@/app/context/EeyanContext';

interface ArticleViewCounterProps {
  articleId: string;
  lawCategory: string;
  law: string;
}

const CACHE_DURATION = 30 * 1000; // 30秒

/**
 * 条文ページの閲覧数カウンター
 * - ページ表示時にセッション内で1回だけインクリメント
 * - 閲覧数を控えめに表示
 */
export function ArticleViewCounter({ articleId, lawCategory, law }: ArticleViewCounterProps) {
  const [count, setCount] = useState<number>(0);
  const hasIncremented = useRef(false);
  const notifyChanged = useNotifyEeyanChanged();

  const counterId = getNostalgicId(lawCategory, law, articleId);

  useEffect(() => {
    const fetchAndIncrement = async () => {
      try {
        // セッション内で一度だけインクリメント（重複防止）
        const sessionKey = `counter_incremented_${counterId}`;
        const alreadyIncremented = safeSessionGet(sessionKey);

        const cacheKey = `counter_value_${counterId}`;
        const cacheTimeKey = `${cacheKey}_time`;

        // 初回（セッション内未カウント）: increment し、そのレスポンスが返す
        // 更新後 total をそのまま使う。increment は同一書き込み直後の値を返すため、
        // 別途 get する必要はない（冗長リクエスト削減＋レプリカ遅延を避けて正確）。
        if (!alreadyIncremented && !hasIncremented.current) {
          const incrementUrl = `${NOSTALGIC_COUNTER_API_BASE}?action=increment&id=${encodeURIComponent(counterId)}`;
          const incrementRes = await fetch(incrementUrl);
          if (incrementRes.ok) {
            safeSessionSet(sessionKey, 'true');
            hasIncremented.current = true;
            const data = (await incrementRes.json()) as {
              success: boolean;
              data?: { total: number };
            };
            if (data.success && data.data) {
              setCount(data.data.total);
              safeSessionSet(cacheKey, String(data.data.total));
              safeSessionSet(cacheTimeKey, String(Date.now()));
              notifyChanged();
            }
          }
          // 失敗時はマークしない（次回再試行可能）
          return;
        }

        // セッション内で既にカウント済み（再訪）: キャッシュがあれば使い、
        // 切れていれば get で最新値のみ取得（increment はしない）。
        const cached = safeSessionGet(cacheKey);
        const cachedTime = safeSessionGet(cacheTimeKey);
        if (cached && cachedTime && Date.now() - parseInt(cachedTime) < CACHE_DURATION) {
          setCount(parseInt(cached));
          return;
        }

        const displayUrl = `${NOSTALGIC_COUNTER_API_BASE}?action=get&id=${encodeURIComponent(counterId)}&format=json`;
        const response = await fetch(displayUrl);
        if (!response.ok) {
          logger.warn('Counter get API failed', { status: response.status, counterId });
          return;
        }
        const data = (await response.json()) as { success: boolean; data: { total: number } };
        if (data.success) {
          setCount(data.data.total);
          safeSessionSet(cacheKey, String(data.data.total));
          safeSessionSet(cacheTimeKey, String(Date.now()));
        }
      } catch (error) {
        logger.error('Failed to fetch view counter', error, { counterId });
      }
    };

    fetchAndIncrement();
  }, [counterId]);

  return (
    <span className="flex items-center gap-1 text-xs text-gray-400" title={`${count} 閲覧`}>
      <EyeIcon />
      <span>{count.toLocaleString()}</span>
    </span>
  );
}
