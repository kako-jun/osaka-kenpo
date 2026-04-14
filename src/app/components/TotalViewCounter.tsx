'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { NOSTALGIC_COUNTER_API_BASE } from '@/lib/eeyan';
import { logger } from '@/lib/logger';
import { safeSessionGet, safeSessionSet, safeSessionRemove } from '@/lib/storage';
import { useEeyanRevision } from '@/app/context/EeyanContext';

const CACHE_KEY = 'counter_total_all';
const CACHE_TIME_KEY = 'counter_total_all_time';
const CACHE_DURATION = 30 * 1000; // 30秒

/**
 * 全条文の閲覧数合計を表示するコンポーネント
 * sumByPrefix で osaka-kenpo- プレフィックスの全カウンター合計を取得
 */
export function TotalViewCounter() {
  const [total, setTotal] = useState<number>(0);
  const eeyanRevision = useEeyanRevision();

  const fetchTotal = useCallback(async () => {
    try {
      const cached = safeSessionGet(CACHE_KEY);
      const cachedTime = safeSessionGet(CACHE_TIME_KEY);
      if (cached && cachedTime && Date.now() - parseInt(cachedTime) < CACHE_DURATION) {
        setTotal(parseInt(cached));
        return;
      }

      const res = await fetch(
        `${NOSTALGIC_COUNTER_API_BASE}?action=sumByPrefix&prefix=osaka-kenpo-`
      );
      if (!res.ok) {
        logger.warn('Total view counter API failed', { status: res.status });
        return;
      }
      const data = (await res.json()) as { success: boolean; total: number };
      if (data.success) {
        setTotal(data.total);
        safeSessionSet(CACHE_KEY, String(data.total));
        safeSessionSet(CACHE_TIME_KEY, String(Date.now()));
      }
    } catch (error) {
      logger.error('Failed to fetch total view count', error);
    }
  }, []);

  // 初回マウント時に取得
  useEffect(() => {
    fetchTotal();
  }, [fetchTotal]);

  // ええやん/カウンター操作後にキャッシュクリア+再取得
  useEffect(() => {
    if (eeyanRevision === 0) return;
    safeSessionRemove(CACHE_KEY);
    safeSessionRemove(CACHE_TIME_KEY);
    fetchTotal();
  }, [eeyanRevision, fetchTotal]);

  // タブ切り替え時に再取得
  const visibilityTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(visibilityTimerRef.current);
        visibilityTimerRef.current = setTimeout(() => {
          safeSessionRemove(CACHE_KEY);
          safeSessionRemove(CACHE_TIME_KEY);
          fetchTotal();
        }, 500);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(visibilityTimerRef.current);
    };
  }, [fetchTotal]);

  return (
    <span className="font-bold text-[#E94E77] text-xl leading-none align-baseline">
      {total.toLocaleString()}
    </span>
  );
}
