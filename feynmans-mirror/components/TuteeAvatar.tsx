'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { TuteeState } from '@/lib/types';

interface TuteeAvatarProps {
  state: TuteeState;
  isSpeaking?: boolean;
  size?: number;
  hideLabel?: boolean;
}

const STATE_LABELS: Record<TuteeState, string | null> = {
  idle: 'Capy is listening...',
  thinking: 'Capy is thinking...',
  'test-taking': null,
};

function getAnimationClass(state: TuteeState): string {
  switch (state) {
    case 'idle':
      return 'animate-float';
    case 'thinking':
      return 'animate-thinking-glow animate-float';
    case 'test-taking':
      return 'animate-tremble';
  }
}

export default function TuteeAvatar({ state, isSpeaking = false, size = 200, hideLabel = false }: TuteeAvatarProps) {
  const [currentImage, setCurrentImage] = useState<string>(`/tutee/${state === 'test-taking' ? 'test-taking-1' : state}.png`);
  const [, setTestFrame] = useState<1 | 2>(1);
  // 2 mouth frames: closed (0) and open (1)
  const [mouthOpen, setMouthOpen] = useState(false);

  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(false); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }

    // Toggle between closed and open at randomized intervals
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setMouthOpen((prev) => !prev);
      timer = setTimeout(tick, 100 + Math.random() * 120);
    };
    timer = setTimeout(tick, 100 + Math.random() * 120);
    return () => clearTimeout(timer);
  }, [isSpeaking]);

  const resolveImage = useCallback((s: TuteeState, frame: 1 | 2) => {
    if (s === 'test-taking') return `/tutee/test-taking-${frame}.png`;
    return `/tutee/${s}.png`;
  }, []);

  // Handle state change transitions
  useEffect(() => {
    const targetImage = resolveImage(state, 1);

    if (state === 'test-taking') {
      setTestFrame(1); // eslint-disable-line react-hooks/set-state-in-effect
      setCurrentImage(targetImage);
      return;
    }

    if (targetImage === currentImage) return;

    // Instant swap between idle and thinking (no fade)
    setCurrentImage(targetImage);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Test-taking: alternate frames every 1s (instant swap, no fade)
  useEffect(() => {
    if (state !== 'test-taking') return;

    const interval = setInterval(() => {
      setTestFrame((prev) => {
        const next = prev === 1 ? 2 : 1;
        setCurrentImage(`/tutee/test-taking-${next}.png`);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state]);

  const label = STATE_LABELS[state];
  const showMouth = state === 'idle';
  const isMouthWideOpen = isSpeaking && mouthOpen;
  const mouthScaleY = isMouthWideOpen ? 0.6 : 0.1;
  const mouthScaleX = isMouthWideOpen ? 1 : 0.6;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative rounded-full overflow-hidden ${getAnimationClass(state)}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={currentImage}
          alt="Capy the capybara tutee"
          width={size}
          height={size}
          className="object-cover w-full h-full"
          style={{
            opacity: 1,
            transition: 'opacity 150ms ease-in-out',
          }}
          priority
        />
        {/* Mouth overlay — always visible when idle/thinking, animated when speaking */}
        {showMouth && (
          <div
            className="absolute"
            style={{
              top: '32%',
              left: '52.5%',
              transform: `translateX(-50%) scaleX(${mouthScaleX}) scaleY(${mouthScaleY})`,
              transformOrigin: 'center center',
              width: size * 0.1,
              height: size * 0.1,
              transition: 'transform 60ms ease-in-out',
            }}
          >
            <svg
              viewBox="0 0 28 28"
              fill="none"
              className="w-full h-full"
            >
              <ellipse cx="14" cy="14" rx="10" ry="8" fill="#2D2A24" />
              <ellipse cx="14" cy="12" rx="5" ry="2.5" fill="#E88B7A" style={{ opacity: isMouthWideOpen ? 1 : 0, transition: 'opacity 60ms ease-in-out' }} />
            </svg>
          </div>
        )}
      </div>
      {label && !hideLabel && (
        <p className="type-caption text-warm-gray">{label}</p>
      )}
    </div>
  );
}
