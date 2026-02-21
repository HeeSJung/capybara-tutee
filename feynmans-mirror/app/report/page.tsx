'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession } from '@/lib/session-context';
import GradingCard from '@/components/GradingCard';

export default function ReportPage() {
  const { state } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!state.grading) {
      router.push('/');
    }
  }, [state.grading, router]);

  if (!state.grading) return null;

  const { overallScore, totalQuestions, percentage, questionResults } = state.grading;

  const getCapyImage = () => {
    if (percentage >= 80) return '/tutee/good-grade.png';
    if (percentage >= 50) return '/tutee/normal-grade.png';
    return '/tutee/bad-grade.png';
  };

  const getHeroHeader = () => {
    if (percentage >= 80) return 'Amazing! Capy aced it!';
    if (percentage >= 50) return 'Not bad! Capy did okay.';
    return 'Oof... Capy struggled.';
  };

  const getSubtitle = () => {
    if (percentage >= 80) return 'Great teaching!';
    if (percentage >= 50) return 'Some gaps to review.';
    return 'Try teaching these topics again!';
  };

  return (
    <div className="mx-auto px-6 py-12" style={{ maxWidth: '900px' }}>
      {/* Hero Banner */}
      <div className="rounded-2xl bg-white p-8 shadow-sm" style={{ marginBottom: '2.5rem' }}>
        <div className="flex flex-col items-center gap-8 md:flex-row">
          {/* Capy image */}
          <div className="flex-shrink-0">
            <Image
              src={getCapyImage()}
              alt="Capy grade reaction"
              width={260}
              height={260}
              style={{ width: '260px', height: '260px', objectFit: 'contain' }}
              priority
            />
          </div>

          {/* Score + messaging */}
          <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
            <h1 className="type-h2 text-cocoa">{getHeroHeader()}</h1>
            <div>
              <span
                className="font-bold leading-none text-terracotta"
                style={{ fontSize: '4.5rem' }}
              >
                {percentage}%
              </span>
              <p className="type-body mt-1 text-warm-gray">
                {overallScore} / {totalQuestions} correct
              </p>
            </div>
            <p className="type-body text-warm-gray">{getSubtitle()}</p>
          </div>
        </div>
      </div>

      {/* Question results */}
      <div className="space-y-4">
        <h2 className="type-body font-semibold text-cocoa">
          Question Breakdown
        </h2>
        {questionResults.map((result, i) => (
          <GradingCard key={result.questionId} result={result} index={i} />
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4" style={{ marginTop: '2.5rem' }}>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="type-button rounded-[12px] bg-terracotta px-6 py-3 text-on-accent shadow-sm transition-all hover:bg-[#d06a50] hover:shadow-md"
        >
          Try Another Topic
        </button>
      </div>
    </div>
  );
}
