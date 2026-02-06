interface StageCardProps {
  stage: string;
  title: string;
  emoji: string;
  completed: number;
  total: number;
  percentage: number;
  color: string;
}

export function StageCard({
  stage,
  title,
  emoji,
  completed,
  total,
  percentage,
  color,
}: StageCardProps) {
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
