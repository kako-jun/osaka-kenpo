'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NOSTALGIC_API_BASE } from '@/lib/eeyan';
import type { LawEntry } from '@/data/lawsMetadata';

interface LawCardWithEeyanProps {
  law: LawEntry;
}

export function LawCardWithEeyan({ law }: LawCardWithEeyanProps) {
  const [totalLikes, setTotalLikes] = useState<number | null>(null);

  useEffect(() => {
    if (law.status !== 'available') return;

    // Extract category and lawName from path: /law/{category}/{lawName}
    const parts = law.path.split('/');
    const category = parts[2];
    const lawName = parts[3];
    if (!category || !lawName) return;

    const cacheKey = `eeyan_total_${category}_${lawName}`;
    const cacheTimeKey = `${cacheKey}_time`;

    // Check sessionStorage cache (5 min)
    const cached = sessionStorage.getItem(cacheKey);
    const cachedTime = sessionStorage.getItem(cacheTimeKey);
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
          sessionStorage.setItem(cacheKey, String(d.total));
          sessionStorage.setItem(cacheTimeKey, String(Date.now()));
        }
      })
      .catch(() => {});
  }, [law]);

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
        {totalLikes !== null && (
          <span className="absolute bottom-2 right-2 text-xs font-normal text-[#FFB6C1] flex items-center gap-1">
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
      </div>
    </Link>
  );
}
