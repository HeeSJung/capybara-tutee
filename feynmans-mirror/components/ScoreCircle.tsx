'use client';

interface ScoreCircleProps {
  score: number;
  total: number;
}

export default function ScoreCircle({ score, total }: ScoreCircleProps) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center">
      <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border-4 border-terracotta bg-white">
        <span className="text-4xl font-bold text-cocoa">
          {score}/{total}
        </span>
        <span className="type-caption text-warm-gray">{percentage}%</span>
      </div>
    </div>
  );
}
