'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-context';
import { getStoredFile } from '@/lib/file-store';

const loadingMessages = [
  'Capy is sharpening his pencil\u2026',
  'Capy is stretching before class\u2026',
  'Capy is finding a comfy seat\u2026',
  'Capy is getting excited to learn\u2026',
  'Almost ready\u2026',
];

export default function TopicPage() {
  const { state, setSourceData, setOracleData, setScreen } = useSession();
  const router = useRouter();
  const [subtopic, setSubtopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  // Rotate loading messages
  useEffect(() => {
    if (!loading) {
      setLoadingMsgIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  // Guard: redirect to upload if no source data
  useEffect(() => {
    if (state.source.sourceText === '' && state.source.sourceType !== 'pdf') {
      router.push('/');
    }
  }, [state.source.sourceText, state.source.sourceType, router]);

  const sourceLabel =
    state.source.sourceType === 'pdf' && state.source.fileName
      ? `Source: ${state.source.fileName} \u2713`
      : 'Source: Pasted text \u2713';

  async function handleStartTeaching() {
    const trimmed = subtopic.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');

    try {
      let res: Response;

      if (state.source.sourceType === 'pdf') {
        const file = getStoredFile();
        if (!file) {
          setError('PDF file not found. Please go back and re-upload.');
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('subtopic', trimmed);
        res = await fetch('/api/process-source', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('/api/process-source', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceText: state.source.sourceText,
            subtopic: trimmed,
          }),
        });
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || 'Something went wrong. Please try again.');
        return;
      }

      const data = await res.json();

      setSourceData({ subtopic: trimmed });
      setOracleData({
        topicOutline: data.topicOutline,
        testQuestions: data.testQuestions,
        answerKey: data.answerKey,
        generatedAt: new Date(),
      });
      setScreen('teaching');
      router.push('/teach');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setScreen('upload');
    router.push('/');
  }

  return (
    <div className="mx-auto max-w-[800px] px-8 py-12">
      {/* Back navigation */}
      <button
        type="button"
        onClick={handleBack}
        className="type-caption mb-8 inline-flex items-center gap-1 text-warm-gray transition-colors hover:text-cocoa"
      >
        &larr; Back
      </button>

      {/* Title */}
      <h2 className="type-h2 mb-2 text-cocoa">
        What topic will you teach today?
      </h2>

      {/* Source confirmation */}
      <p className="type-caption mb-8 text-success">{sourceLabel}</p>

      {/* Topic input */}
      <input
        type="text"
        value={subtopic}
        onChange={(e) => setSubtopic(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && subtopic.trim() && !loading) {
            handleStartTeaching();
          }
        }}
        placeholder="e.g., Photosynthesis"
        disabled={loading}
        className="type-body w-full rounded-[12px] border-2 border-input-border bg-white px-4 py-3 placeholder:text-light-gray focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 disabled:opacity-50"
      />

      {/* Hint text */}
      <p className="type-caption mt-2 text-warm-gray">
        Choose a specific subtopic from your uploaded source. The AI will scope
        the evaluation to this area.
      </p>

      {/* CTA button */}
      <button
        type="button"
        onClick={handleStartTeaching}
        disabled={loading || !subtopic.trim()}
        className="type-button mt-6 rounded-[12px] bg-terracotta px-6 py-3 text-on-accent shadow-sm transition-all hover:bg-terracotta-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-4 w-4 animate-pulse rounded-full bg-on-accent/60" />
            Capy is getting ready to learn...
          </span>
        ) : (
          'Start Teaching \u2192'
        )}
      </button>

      {/* Loading animation */}
      {loading && (
        <div className="mt-10 flex flex-col items-center gap-4" style={{ animation: 'capyEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
          <div className="animate-float rounded-2xl p-2">
            <img
              src="/tutee/idle.png"
              alt="Capy preparing"
              className="h-64 w-auto"
            />
          </div>
          <p className="type-body animate-pulse text-warm-gray">
            {loadingMessages[loadingMsgIndex]}
          </p>
          <style jsx>{`
            @keyframes capyEntrance {
              0% { opacity: 0; transform: translateY(40px) scale(0.8); }
              60% { opacity: 1; transform: translateY(-8px) scale(1.02); }
              80% { transform: translateY(2px) scale(0.99); }
              100% { transform: translateY(0) scale(1); }
            }
          `}</style>
        </div>
      )}

      {/* Error display */}
      {error && (
        <p className="type-body mt-3 text-error">{error}</p>
      )}
    </div>
  );
}
