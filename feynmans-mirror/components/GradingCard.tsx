'use client';

import { useState } from 'react';
import type { QuestionResult } from '@/lib/types';

interface GradingCardProps {
  result: QuestionResult;
  index: number;
}

export default function GradingCard({ result, index }: GradingCardProps) {
  const isCorrect = result.isCorrect;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={`cursor-pointer rounded-[16px] border-l-4 bg-white p-6 shadow-sm ${
        isCorrect ? 'border-[#4CAF7D]' : 'border-[#E57373]'
      }`}
    >
      {/* Question header */}
      <div className={`flex items-start justify-between gap-3 ${isExpanded ? 'mb-4' : ''}`}>
        <div className="flex flex-1 items-start gap-3">
          <span
            className={`mt-0.5 inline-flex shrink-0 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold text-white ${
              isCorrect ? 'bg-[#4CAF7D]' : 'bg-[#E57373]'
            }`}
          >
            Q{index + 1}
          </span>
          <p className="font-semibold text-cocoa" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
            {result.question}
          </p>
        </div>
        <div className="mt-0.5 flex shrink-0 items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isCorrect
                ? 'bg-[#E8F5E9] text-[#2E7D32]'
                : 'bg-[#FFEBEE] text-[#C62828]'
            }`}
          >
            {isCorrect ? 'Correct' : 'Incorrect'}
          </span>
          <span
            className="text-xs text-warm-gray transition-transform duration-200"
            style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block' }}
          >
            &#9658;
          </span>
        </div>
      </div>

      {/* Collapsible detail section */}
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          {/* Capy's answer */}
          <div className="mb-3">
            <p className="type-caption text-warm-gray">Capy&apos;s Answer:</p>
            <div className="mt-2 rounded-lg bg-[#FAF5EF] p-3">
              <p className="type-body italic text-warm-gray">{result.tuteeAnswer}</p>
            </div>
          </div>

          {/* Expected answer + gap (only for incorrect) */}
          {!isCorrect && (
            <>
              <div className="mb-3">
                <p className="type-caption text-warm-gray">Expected Answer:</p>
                <div className="mt-2 rounded-lg bg-[#E8F5F1] p-3">
                  <p className="type-body text-cocoa">{result.expectedAnswer}</p>
                </div>
              </div>
              {result.gap && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#FFB74D] bg-[#FFF3E0] p-3">
                  <span className="shrink-0 text-base leading-snug">&#x26A0;&#xFE0F;</span>
                  <p className="type-body text-[#E65100]">{result.gap}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
