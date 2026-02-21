'use client';

import React from 'react';

interface SpeechBubbleProps {
  variant: 'tutee' | 'user';
  children: React.ReactNode;
}

export default function SpeechBubble({ variant, children }: SpeechBubbleProps) {
  const isTutee = variant === 'tutee';

  return (
    <div className="relative inline-block max-w-[60%]">
      <div
        className="type-bubble px-4 py-3"
        style={{
          background: isTutee ? 'var(--color-bubble-tutee)' : 'var(--color-bubble-user)',
          border: isTutee ? '1px solid var(--color-bubble-tutee-border)' : '1px solid var(--color-bubble-user-border)',
          color: isTutee ? 'var(--color-cocoa)' : 'var(--color-on-accent)',
          borderRadius: isTutee ? '4px 16px 16px 16px' : '4px 16px 16px 16px',
          boxShadow: '0 4px 12px rgba(45,42,36,0.10)',
        }}
      >
        {children}
      </div>

      {/* Left-pointing tail */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: -8,
          bottom: 16,
          width: 0,
          height: 0,
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderRight: isTutee ? '8px solid #FFE4D9' : '8px solid #5BA89D',
        }}
      />
    </div>
  );
}
