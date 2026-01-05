"use client";

import { useEffect, useState } from "react";

interface NostalgicCounterProps {
  counterId: string;
  type?: "total" | "today" | "yesterday" | "week" | "month";
  digits?: string;
}

const NostalgicCounter = ({ counterId, type = "total", digits = "4" }: NostalgicCounterProps) => {
  const [count, setCount] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        // まずインクリメント
        const incrementUrl = `https://api.nostalgic.llll-ll.com/visit?action=increment&id=${encodeURIComponent(
          counterId
        )}`;
        await fetch(incrementUrl);

        // その後表示用の値を取得（テキスト形式、digits指定付き）
        const displayUrl = `https://api.nostalgic.llll-ll.com/visit?action=get&id=${encodeURIComponent(
          counterId
        )}&type=${type}&format=text&digits=${digits}`;
        const response = await fetch(displayUrl);
        const text = await response.text();
        setCount(text);
      } catch (error) {
        console.error("Failed to fetch counter:", error);
        setCount("0".repeat(parseInt(digits)));
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, [counterId, type, digits]);

  if (loading) {
    return (
      <span className="font-bold text-[#E94E77] text-xl leading-none align-baseline">
        {"0".repeat(parseInt(digits))}
      </span>
    );
  }

  return <span className="font-bold text-[#E94E77] text-xl leading-none align-baseline">{count}</span>;
};

export default NostalgicCounter;
