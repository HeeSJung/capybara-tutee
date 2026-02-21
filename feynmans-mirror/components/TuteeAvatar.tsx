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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [testFrame, setTestFrame] = useState<1 | 2>(1);
  // 3 discrete mouth frames: closed (0), half (0.5), full (1)
  const MOUTH_FRAMES = [0, 0.5, 1] as const;
  const [mouthFrame, setMouthFrame] = useState(0);

  useEffect(() => {
    if (!isSpeaking) {
      setMouthFrame(0);
      return;
    }

    // Snap between frames at randomized intervals (80-180ms)
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setMouthFrame((prev) => {
        let next: number;
        do {
          next = Math.floor(Math.random() * MOUTH_FRAMES.length);
        } while (next === prev);
        return next;
      });
      timer = setTimeout(tick, 80 + Math.random() * 100);
    };
    timer = setTimeout(tick, 80 + Math.random() * 100);
    return () => clearTimeout(timer);
  }, [isSpeaking]); // eslint-disable-line react-hooks/exhaustive-deps

  const resolveImage = useCallback((s: TuteeState, frame: 1 | 2) => {
    if (s === 'test-taking') return `/tutee/test-taking-${frame}.png`;
    return `/tutee/${s}.png`;
  }, []);

  // Handle state change transitions (fade out -> swap -> fade in)
  useEffect(() => {
    const targetImage = resolveImage(state, 1);

    if (state === 'test-taking') {
      setTestFrame(1);
      setCurrentImage(targetImage);
      return;
    }

    if (targetImage === currentImage) return;

    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setCurrentImage(targetImage);
      setTimeout(() => setIsTransitioning(false), 20);
    }, 150);

    return () => clearTimeout(timer);
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
  const mouthOpen = MOUTH_FRAMES[mouthFrame];
  const showMouth = isSpeaking && mouthOpen > 0;

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
            opacity: isTransitioning ? 0 : 1,
            transition: 'opacity 150ms ease-in-out',
          }}
          priority
        />
        {/* Speaking mouth overlay — JS-driven with randomized open amount */}
        {showMouth && (
          <div
            className="absolute"
            style={{
              top: '32%',
              left: '52.5%',
              transform: `translateX(-50%) scaleY(${mouthOpen})`,
              transformOrigin: 'center top',
              width: size * 0.1,
              height: size * 0.1,
            }}
          >
            <svg
              viewBox="0 0 28 28"
              fill="none"
              className="w-full h-full"
            >
              <circle cx="14" cy="14" r="10" fill="#2D2A24" />
              <ellipse cx="14" cy="11" rx="6" ry="3" fill="#E88B7A" />
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
