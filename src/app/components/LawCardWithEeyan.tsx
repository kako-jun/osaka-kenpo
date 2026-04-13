'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { NOSTALGIC_API_BASE, NOSTALGIC_COUNTER_API_BASE } from '@/lib/eeyan';
import { useEeyanRevision } from '@/app/context/EeyanContext';
import type { LawEntry } from '@/data/lawsMetadata';

interface LawCardWithEeyanProps {
  law: LawEntry;
}

/** sessionStorage の安全なラッパー（ストレージ制限環境でクラッシュしない） */
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

function safeSessionRemove(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ストレージ制限環境では無視
  }
}

export function LawCardWithEeyan({ law }: LawCardWithEeyanProps) {
  const [totalLikes, setTotalLikes] = useState<number | null>(null);
  const [totalViews, setTotalViews] = useState<number | null>(null);
  const eeyanRevision = useEeyanRevision();

  const fetchTotalLikes = useCallback(() => {
    if (law.status !== 'available') return;

    // Extract category and lawName from path: /law/{category}/{lawName}
    const parts = law.path.split('/');
    const category = parts[2];
    const lawName = parts[3];
    if (!category || !lawName) return;

    const cacheKey = `eeyan_total_${category}_${lawName}`;
    const cacheTimeKey = `${cacheKey}_time`;

    // Check sessionStorage cache (5 min)
    const cached = safeSessionGet(cacheKey);
    const cachedTime = safeSessionGet(cacheTimeKey);
    if (cached && cachedTime && Date.now() - Number(cachedTime) < 5 * 60 * 1000) {
      setTotalLikes(Number(cached));
      return;
    }

    const prefix = `osaka-kenpo-${category}-${lawName}-`;
    fetch(`${NOSTALGIC_API_BASE}?action=sumByPrefix&prefix=${prefix}`)
      .then((res) => res.json())
      .then((data) => {
        const d = data as { success: boolean; total: number };
        if (d.success) {
          setTotalLikes(d.total);
          safeSessionSet(cacheKey, String(d.total));
          safeSessionSet(cacheTimeKey, String(Date.now()));
        }
      })
      .catch(() => {});
  }, [law]);

  const fetchTotalViews = useCallback(() => {
    if (law.status !== 'available') return;

    const parts = law.path.split('/');
    const category = parts[2];
    const lawName = parts[3];
    if (!category || !lawName) return;

    const cacheKey = `counter_total_${category}_${lawName}`;
    const cacheTimeKey = `${cacheKey}_time`;

    const cached = safeSessionGet(cacheKey);
    const cachedTime = safeSessionGet(cacheTimeKey);
    if (cached && cachedTime && Date.now() - Number(cachedTime) < 5 * 60 * 1000) {
      setTotalViews(Number(cached));
      return;
    }

    const prefix = `osaka-kenpo-${category}-${lawName}-`;
    fetch(`${NOSTALGIC_COUNTER_API_BASE}?action=sumByPrefix&prefix=${prefix}`)
      .then((res) => res.json())
      .then((data) => {
        const d = data as { success: boolean; total: number };
        if (d.success) {
          setTotalViews(d.total);
          safeSessionSet(cacheKey, String(d.total));
          safeSessionSet(cacheTimeKey, String(Date.now()));
        }
      })
      .catch(() => {});
  }, [law]);

  // 初回マウント時 + props変更時に取得
  useEffect(() => {
    fetchTotalLikes();
    fetchTotalViews();
  }, [fetchTotalLikes, fetchTotalViews]);

  // ええやん操作後にキャッシュをクリアして再取得
  useEffect(() => {
    if (eeyanRevision === 0) return; // 初回マウント時はスキップ
    if (law.status !== 'available') return;
    const parts = law.path.split('/');
    const category = parts[2];
    const lawName = parts[3];
    if (!category || !lawName) return;
    const cacheKey = `eeyan_total_${category}_${lawName}`;
    safeSessionRemove(cacheKey);
    safeSessionRemove(`${cacheKey}_time`);
    fetchTotalLikes();
  }, [eeyanRevision, law, fetchTotalLikes]);

  // ページが再表示された時にデータを再取得（キャッシュ無視、デバウンス付き）
  const visibilityTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(visibilityTimerRef.current);
        visibilityTimerRef.current = setTimeout(() => {
          // キャッシュを無効化して再取得
          if (law.status !== 'available') return;
          const parts = law.path.split('/');
          const category = parts[2];
          const lawName = parts[3];
          if (!category || !lawName) return;
          const eeyanCacheKey = `eeyan_total_${category}_${lawName}`;
          const counterCacheKey = `counter_total_${category}_${lawName}`;
          safeSessionRemove(eeyanCacheKey);
          safeSessionRemove(`${eeyanCacheKey}_time`);
          safeSessionRemove(counterCacheKey);
          safeSessionRemove(`${counterCacheKey}_time`);
          fetchTotalLikes();
          fetchTotalViews();
        }, 500);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(visibilityTimerRef.current);
    };
  }, [fetchTotalLikes, fetchTotalViews, law]);

  if (law.status !== 'available') {
    return (
      <div className="h-32 flex flex-col justify-center p-6 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.1)] text-center text-white font-bold text-xl bg-gray-400 relative">
        <p className="mb-1 mt-3">{law.shortName}</p>
        {law.year && <p className="text-sm font-normal text-gray-300">{law.year}年</p>}
        {law.badge && (
          <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold text-white shadow-[0_0_8px_rgba(0,0,0,0.25)] bg-[#ed6b8a]">
            {law.badge}
          </span>
        )}
        <span className="absolute bottom-2 right-2 text-xs font-normal bg-gray-500 px-2 py-1 rounded">
          準備中やで
        </span>
      </div>
    );
  }

  return (
    <Link href={law.path} passHref className="block">
      <div className="h-32 flex flex-col justify-center p-6 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.1)] text-center text-white font-bold text-xl bg-[#E94E77] hover:bg-opacity-80 relative">
        <p className="mb-1 mt-3">{law.shortName}</p>
        {law.year && <p className="text-sm font-normal text-[#FFB6C1]">{law.year}年</p>}
        {law.badge && (
          <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold text-white shadow-[0_0_8px_rgba(0,0,0,0.25)] bg-[#ed6b8a]">
            {law.badge}
          </span>
        )}
        {(totalLikes !== null || totalViews !== null) && (
          <span className="absolute bottom-2 right-2 text-xs font-normal text-[#FFB6C1] flex items-center gap-3">
            {totalViews !== null && (
              <span className="flex items-center gap-1">
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
                <span>{totalViews.toLocaleString()}</span>
              </span>
            )}
            {totalLikes !== null && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{totalLikes.toLocaleString()} ええやん</span>
              </span>
            )}
          </span>
        )}
      </div>
    </Link>
  );
}
