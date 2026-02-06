'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { logger } from '@/lib/logger';

interface LawProgress {
  id: string;
  name: string;
  category: string;
  totalArticles: number;
  status: string;
  progress: {
    stage1_originalText: number;
    stage2_commentary: number;
    stage3_osakaText: number;
    stage4_commentaryOsaka: number;
  };
}

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

interface StageCardProps {
  stage: string;
  title: string;
  emoji: string;
  completed: number;
  total: number;
  percentage: number;
  color: string;
}

function StageCard({ stage, title, emoji, completed, total, percentage, color }: StageCardProps) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
      <div className="text-3xl mb-2">{emoji}</div>
      <div className="text-sm text-gray-500 mb-1">{stage}</div>
      <div className="text-lg font-bold text-gray-800 mb-3">{title}</div>
      <div className="mb-2">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="text-sm text-gray-600">
        {completed} / {total} 条
        <span className="ml-2 font-semibold text-gray-800">({percentage.toFixed(1)}%)</span>
      </div>
    </div>
  );
}

interface LawProgressCardProps {
  law: LawProgress;
}

function LawProgressCard({ law }: LawProgressCardProps) {
  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
          完成
        </span>
      );
    } else if (status === 'pending') {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
          準備中
        </span>
      );
    }
    return null;
  };

  const calculatePercentage = (completed: number, total: number) => {
    return total > 0 ? (completed / total) * 100 : 0;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-gray-800">{law.name}</h3>
        {getStatusBadge(law.status)}
      </div>
      <p className="text-sm text-gray-500 mb-4">全 {law.totalArticles} 条</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ProgressBar
          label="原文"
          completed={law.progress.stage1_originalText}
          total={law.totalArticles}
          percentage={calculatePercentage(law.progress.stage1_originalText, law.totalArticles)}
          color="bg-blue-500"
        />
        <ProgressBar
          label="解説"
          completed={law.progress.stage2_commentary}
          total={law.totalArticles}
          percentage={calculatePercentage(law.progress.stage2_commentary, law.totalArticles)}
          color="bg-green-500"
        />
        <ProgressBar
          label="大阪弁訳"
          completed={law.progress.stage3_osakaText}
          total={law.totalArticles}
          percentage={calculatePercentage(law.progress.stage3_osakaText, law.totalArticles)}
          color="bg-orange-500"
        />
        <ProgressBar
          label="大阪弁解説"
          completed={law.progress.stage4_commentaryOsaka}
          total={law.totalArticles}
          percentage={calculatePercentage(law.progress.stage4_commentaryOsaka, law.totalArticles)}
          color="bg-pink-500"
        />
      </div>
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  completed: number;
  total: number;
  percentage: number;
  color: string;
}

function ProgressBar({ label, completed, total, percentage, color }: ProgressBarProps) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-1 overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-600">
        {completed} / {total}
      </div>
    </div>
  );
}
