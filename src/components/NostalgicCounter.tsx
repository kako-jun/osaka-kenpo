'use client';

import { useEffect, useState, useRef } from 'react';

interface NostalgicCounterProps {
  counterId: string;
  type?: 'total' | 'today' | 'yesterday' | 'week' | 'month';
  digits?: string;
}

const NostalgicCounter = ({ counterId, type = 'total', digits = '4' }: NostalgicCounterProps) => {
  const [count, setCount] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const hasIncremented = useRef(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        // セッション内で一度だけインクリメント（重複防止）
        const sessionKey = `counter_incremented_${counterId}`;
        const alreadyIncremented = sessionStorage.getItem(sessionKey);

        if (!alreadyIncremented && !hasIncremented.current) {
          const incrementUrl = `https://api.nostalgic.llll-ll.com/visit?action=increment&id=${encodeURIComponent(
            counterId
          )}`;
          await fetch(incrementUrl);
          sessionStorage.setItem(sessionKey, 'true');
          hasIncremented.current = true;
        }

        // 表示用の値を取得（キャッシュ付き、5分間有効）
        const displayKey = `counter_value_${counterId}_${type}`;
        const cachedData = sessionStorage.getItem(displayKey);
        const cachedTime = sessionStorage.getItem(`${displayKey}_time`);
        const now = Date.now();
        const CACHE_DURATION = 5 * 60 * 1000; // 5分

        if (cachedData && cachedTime && now - parseInt(cachedTime) < CACHE_DURATION) {
          setCount(cachedData);
        } else {
          const displayUrl = `https://api.nostalgic.llll-ll.com/visit?action=get&id=${encodeURIComponent(
            counterId
          )}&type=${type}&format=text&digits=${digits}`;
          const response = await fetch(displayUrl);
          const text = await response.text();
          setCount(text);
          sessionStorage.setItem(displayKey, text);
          sessionStorage.setItem(`${displayKey}_time`, now.toString());
        }
      } catch (error) {
        console.error('Failed to fetch counter:', error);
        setCount('0'.repeat(parseInt(digits)));
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, [counterId, type, digits]);

  if (loading) {
    return (
      <span className="font-bold text-[#E94E77] text-xl leading-none align-baseline">
        {'0'.repeat(parseInt(digits))}
      </span>
    );
  }

  return (
    <span className="font-bold text-[#E94E77] text-xl leading-none align-baseline">{count}</span>
  );
};

export default NostalgicCounter;
