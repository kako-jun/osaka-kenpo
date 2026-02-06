'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { logger } from '@/lib/logger';
import { StageCard } from './components/StageCard';
import { LawProgressCard, type LawProgress } from './components/LawProgressCard';

interface ProgressData {
  laws: LawProgress[];
  summary: {
    totalArticles: number;
    stage1_completed: number;
    stage2_completed: number;
    stage3_completed: number;
    stage4_completed: number;
    stage1_percentage: number;
    stage2_percentage: number;
    stage3_percentage: number;
    stage4_percentage: number;
  };
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/progress/roppou')
      .then((res) => res.json() as Promise<ProgressData>)
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        logger.error('Failed to fetch progress', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-orange-50">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-lg text-gray-600">読み込み中やで...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-orange-50">
        <div className="text-center">
          <p className="text-lg text-red-600">データが読み込めへんかったわ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            六法整備の進み具合やで
          </h1>
          <p className="text-lg text-gray-600">4段階で頑張って整備してるんや</p>
          <Link href="/" className="inline-block mt-4 text-[#E94E77] hover:underline">
            ← トップに戻る
          </Link>
        </div>

        {/* 全体サマリー */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 全体の進捗</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StageCard
              stage="Stage 1"
              title="原文"
              emoji="📝"
              completed={data.summary.stage1_completed}
              total={data.summary.totalArticles}
              percentage={data.summary.stage1_percentage}
              color="from-blue-400 to-blue-600"
            />
            <StageCard
              stage="Stage 2"
              title="解説"
              emoji="📖"
              completed={data.summary.stage2_completed}
              total={data.summary.totalArticles}
              percentage={data.summary.stage2_percentage}
              color="from-green-400 to-green-600"
            />
            <StageCard
              stage="Stage 3"
              title="大阪弁訳"
              emoji="🗣️"
              completed={data.summary.stage3_completed}
              total={data.summary.totalArticles}
              percentage={data.summary.stage3_percentage}
              color="from-orange-400 to-orange-600"
            />
            <StageCard
              stage="Stage 4"
              title="大阪弁解説"
              emoji="💬"
              completed={data.summary.stage4_completed}
              total={data.summary.totalArticles}
              percentage={data.summary.stage4_percentage}
              color="from-pink-400 to-pink-600"
            />
          </div>
        </div>

        {/* 各法律の詳細 */}
        <div className="space-y-6">
          {data.laws.map((law) => (
            <LawProgressCard key={law.id} law={law} />
          ))}
        </div>

        {/* 説明 */}
        <div className="mt-12 bg-gradient-to-r from-pink-100 to-orange-100 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📌 4段階戦略とは？</h3>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Stage 1 (原文):</strong> e-Gov法令検索APIから原文を取得
            </p>
            <p>
              <strong>Stage 2 (解説):</strong> 法律の内容を分かりやすく解説
            </p>
            <p>
              <strong>Stage 3 (大阪弁訳):</strong> 原文を親しみやすい大阪弁に翻訳
            </p>
            <p>
              <strong>Stage 4 (大阪弁解説):</strong> 解説も大阪弁で書き直す
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
