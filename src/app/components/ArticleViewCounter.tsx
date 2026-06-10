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
      const cacheKey = `counter_value_${counterId}`;
      const cacheTimeKey = `${cacheKey}_time`;

      // 表示値を state とセッションキャッシュに反映する
      const applyCount = (total: number) => {
        setCount(total);
        safeSessionSet(cacheKey, String(total));
        safeSessionSet(cacheTimeKey, String(Date.now()));
      };

      // get で最新値のみ取得して反映（increment はしない）。フォールバックにも使う。
      const fetchLatest = async () => {
        const displayUrl = `${NOSTALGIC_COUNTER_API_BASE}?action=get&id=${encodeURIComponent(counterId)}&format=json`;
        const response = await fetch(displayUrl);
        if (!response.ok) {
          logger.warn('Counter get API failed', { status: response.status, counterId });
          return;
        }
        const data = (await response.json()) as { success: boolean; data?: { total: number } };
        if (data.success && data.data) {
          applyCount(data.data.total);
        }
      };

      try {
        // セッション内で一度だけインクリメント（重複防止）
        const sessionKey = `counter_incremented_${counterId}`;
        const alreadyIncremented = safeSessionGet(sessionKey);

        // 初回（セッション内未カウント）: increment し、そのレスポンスが返す更新後 total を
        // そのまま使う。increment は同一書き込み直後の値を返すため、別途 get は不要
        // （冗長リクエスト削減＋レプリカ遅延を避けて正確）。
        // レスポンスが期待形でない場合のみ get にフォールバックして表示値を確保する。
        if (!alreadyIncremented && !hasIncremented.current) {
          const incrementUrl = `${NOSTALGIC_COUNTER_API_BASE}?action=increment&id=${encodeURIComponent(counterId)}&format=json`;
          const incrementRes = await fetch(incrementUrl);
          let incremented = false;
          if (incrementRes.ok) {
            safeSessionSet(sessionKey, 'true');
            hasIncremented.current = true;
            incremented = true;
            const data = (await incrementRes.json().catch(() => null)) as {
              success: boolean;
              data?: { total: number };
            } | null;
            if (data?.success && data.data) {
              applyCount(data.data.total);
              notifyChanged();
              return;
            }
          }
          // increment 失敗 or レスポンス不正 → get で表示値を取得
          // （失敗時は sessionKey 未設定で次回再試行可能）
          await fetchLatest();
          if (incremented) {
            notifyChanged();
          }
          return;
        }

        // セッション内で既にカウント済み（再訪）: キャッシュがあれば使い、
        // 切れていれば get で最新値のみ取得（increment はしない）。
        const cached = safeSessionGet(cacheKey);
        const cachedTime = safeSessionGet(cacheTimeKey);
        if (cached && cachedTime && Date.now() - parseInt(cachedTime, 10) < CACHE_DURATION) {
          setCount(parseInt(cached, 10));
          return;
        }
        await fetchLatest();
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
