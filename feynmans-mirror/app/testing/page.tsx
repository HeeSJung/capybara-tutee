'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-context';
import TuteeAvatar from '@/components/TuteeAvatar';
import ProgressBar from '@/components/ProgressBar';
import type { GradingData } from '@/lib/types';

interface ProgressState {
  phase: 'answering' | 'grading';
  current: number;
  total: number;
}

export default function TestingPage() {
  const { state, setGradingData, setScreen } = useSession();
  const router = useRouter();

  const [progress, setProgress] = useState<ProgressState>({
    phase: 'answering',
    current: 0,
    total: state.oracle?.testQuestions.length ?? 0,
  });
  const [error, setError] = useState('');
  const hasFetched = useRef(false);

  // Guard: redirect if no oracle data
  useEffect(() => {
    if (!state.oracle) {
      router.push('/');
    }
  }, [state.oracle, router]);

  // Start grading on mount
  useEffect(() => {
    if (!state.oracle || hasFetched.current) return;
    hasFetched.current = true;

    const body = {
      conversationHistory: state.conversation.messages,
      testQuestions: state.oracle.testQuestions,
      answerKey: state.oracle.answerKey,
      topicOutline: state.oracle.topicOutline,
      coveredSubtopics: state.conversation.coveredSubtopics,
    };

    async function runGrading() {
      try {
        const res = await fetch('/api/grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          throw new Error(`Grade API error: ${res.status}`);
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let currentEvent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (currentEvent === 'progress') {
                  setProgress({
                    phase: data.phase,
                    current: data.current,
                    total: data.total,
                  });
                } else if (currentEvent === 'done') {
                  const gradingData: GradingData = {
                    overallScore: data.overallScore,
                    totalQuestions: data.totalQuestions,
                    percentage: data.percentage,
                    questionResults: data.questionResults,
                    tuteeTestAnswers: data.tuteeTestAnswers,
                    gradedAt: new Date(),
                  };
                  setGradingData(gradingData);
                  setScreen('report');
                  router.push('/report');
                }
              } catch {
                // Skip malformed JSON lines
              }
            }
          }
        }
      } catch {
        setError('Something went wrong while grading. Please try again.');
        hasFetched.current = false;
      }
    }

    runGrading();
  }, [state.oracle]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = () => {
    hasFetched.current = false;
    setError('');
    router.refresh();
  };

  if (!state.oracle) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <TuteeAvatar state="test-taking" size={240} />

      <div className="text-center">
        <h2 className="type-h2 text-cocoa">Capy is taking the test...</h2>
        <p className="type-body mt-2 max-w-[420px] text-warm-gray">
          Sit tight — Capy is answering questions based only on what you taught.
        </p>
      </div>

      {!error && (
        <ProgressBar
          current={progress.current}
          total={progress.total}
          phase={progress.phase}
        />
      )}

      {error && (
        <div className="flex flex-col items-center gap-4">
          <p className="type-body max-w-[380px] text-center text-error">{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="type-button rounded-[12px] bg-terracotta px-6 py-3 text-on-accent shadow-sm transition-all hover:bg-terracotta-dark hover:shadow-md"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
