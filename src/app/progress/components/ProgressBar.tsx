interface ProgressBarProps {
  label: string;
  completed: number;
  total: number;
  percentage: number;
  color: string;
}

export function ProgressBar({ label, completed, total, percentage, color }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-mono">
          {completed}/{total} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
