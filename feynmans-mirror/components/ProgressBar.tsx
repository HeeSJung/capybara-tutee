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
    <div className="w-full" style={{ maxWidth: '400px' }}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#E8E0D8]">
        {isIndeterminate ? (
          <div
            className="h-full rounded-full bg-terracotta"
            style={{
              width: '30%',
              animation: 'slideRight 1.5s ease-in-out infinite',
            }}
          />
        ) : (
          <div
            className="h-full rounded-full bg-terracotta transition-all duration-500 ease-out"
            style={{ width: `${Math.max(percentage, 2)}%` }}
          />
        )}
      </div>
      <style jsx>{`
        @keyframes slideRight {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(433%); }
        }
      `}</style>
    </div>
  );
}
