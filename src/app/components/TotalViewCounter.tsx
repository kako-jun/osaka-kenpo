'use client';

import { useEffect, useState } from 'react';
import { NOSTALGIC_COUNTER_API_BASE } from '@/lib/eeyan';
import { logger } from '@/lib/logger';
import { safeSessionGet, safeSessionSet } from '@/lib/storage';

const CACHE_KEY = 'counter_total_all';
const CACHE_TIME_KEY = 'counter_total_all_time';
const CACHE_DURATION = 5 * 60 * 1000; // 5分

/**
 * 全条文の閲覧数合計を表示するコンポーネント
 * sumByPrefix で osaka-kenpo- プレフィックスの全カウンター合計を取得
 */
export function TotalViewCounter() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    const fetchTotal = async () => {
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
        const data = (await res.json()) as { success: boolean; total: number };
        if (data.success) {
          setTotal(data.total);
          safeSessionSet(CACHE_KEY, String(data.total));
          safeSessionSet(CACHE_TIME_KEY, String(Date.now()));
        }
      } catch (error) {
        logger.error('Failed to fetch total view count', error);
      }
    };

    fetchTotal();
  }, []);

  if (total === null) {
    return (
      <span className="font-bold text-[#E94E77] text-xl leading-none align-baseline">0000</span>
    );
  }

  return (
    <span className="font-bold text-[#E94E77] text-xl leading-none align-baseline">
      {total.toLocaleString()}
    </span>
  );
}
