'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  phase: string;
}

export default function ProgressBar({ current, total, phase }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const isIndeterminate = phase === 'answering' && current === 0;

  return (
    <div className="w-full">
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#E8E0D8]">
        {isIndeterminate ? (
          <div className="h-full w-full animate-pulse rounded-full bg-terracotta opacity-50" />
        ) : (
          <div
            className="h-full rounded-full bg-terracotta transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
}
