import { ProgressBar } from './ProgressBar';

export interface LawProgress {
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

interface LawProgressCardProps {
  law: LawProgress;
}

function getStatusBadge(status: string) {
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
}

function calculatePercentage(completed: number, total: number) {
  return total > 0 ? (completed / total) * 100 : 0;
}

export function LawProgressCard({ law }: LawProgressCardProps) {
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
          color="#3b82f6"
        />
        <ProgressBar
          label="解説"
          completed={law.progress.stage2_commentary}
          total={law.totalArticles}
          percentage={calculatePercentage(law.progress.stage2_commentary, law.totalArticles)}
          color="#22c55e"
        />
        <ProgressBar
          label="大阪弁訳"
          completed={law.progress.stage3_osakaText}
          total={law.totalArticles}
          percentage={calculatePercentage(law.progress.stage3_osakaText, law.totalArticles)}
          color="#f97316"
        />
        <ProgressBar
          label="大阪弁解説"
          completed={law.progress.stage4_commentaryOsaka}
          total={law.totalArticles}
          percentage={calculatePercentage(law.progress.stage4_commentaryOsaka, law.totalArticles)}
          color="#ec4899"
        />
      </div>
    </div>
  );
}
