'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-context';
import { getStoredFile } from '@/lib/file-store';

export default function TopicPage() {
  const { state, setSourceData, setOracleData, setScreen } = useSession();
  const router = useRouter();
  const [subtopic, setSubtopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        className="type-caption mb-8 inline-flex items-center gap-1 text-[#7A7568] transition-colors hover:text-[#2D2A24]"
      >
        &larr; Back
      </button>

      {/* Title */}
      <h2 className="type-h2 mb-2 text-[#2D2A24]">
        What topic will you teach today?
      </h2>

      {/* Source confirmation */}
      <p className="type-caption mb-8 text-[#4CAF7D]">{sourceLabel}</p>

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
        className="type-body w-full rounded-[12px] border-2 border-[#E8E0D8] bg-white px-4 py-3 placeholder:text-[#B5AFA6] focus:border-[#E07A5F] focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/20 disabled:opacity-50"
      />

      {/* Hint text */}
      <p className="type-caption mt-2 text-[#7A7568]">
        Choose a specific subtopic from your uploaded source. The AI will scope
        the evaluation to this area.
      </p>

      {/* CTA button */}
      <button
        type="button"
        onClick={handleStartTeaching}
        disabled={loading || !subtopic.trim()}
        className="type-button mt-6 rounded-[12px] bg-[#E07A5F] px-6 py-3 text-[#FFFDF9] shadow-sm transition-all hover:bg-[#d06a50] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-4 w-4 animate-pulse rounded-full bg-[#FFFDF9]/60" />
            Capy is getting ready to learn...
          </span>
        ) : (
          'Start Teaching \u2192'
        )}
      </button>

      {/* Error display */}
      {error && (
        <p className="type-body mt-3 text-[#D94C4C]">{error}</p>
      )}
    </div>
  );
}
