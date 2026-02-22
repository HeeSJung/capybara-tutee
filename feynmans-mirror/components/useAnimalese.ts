import { useRef, useEffect } from 'react';

export function useAnimalese(isSpeaking: boolean, streamingText: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const animaleseRef = useRef<any>(null);
  const lastLengthRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize animalese on mount
  useEffect(() => {
    const riffwave = document.createElement('script');
    riffwave.src = '/animalese/riffwave.js';
    document.head.appendChild(riffwave);

    const script = document.createElement('script');
    script.src = '/animalese/animalese.js';
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      animaleseRef.current = new (window as any).Animalese(
        '/animalese/animalese.wav',
        () => {}
      );
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(riffwave);
      document.head.removeChild(script);
    };
  }, []);

  // Play sound as new text chunks arrive during streaming
  useEffect(() => {
    if (!isSpeaking || !animaleseRef.current) return;

    const newChunk = streamingText.slice(lastLengthRef.current);
    lastLengthRef.current = streamingText.length;

    if (newChunk.length < 1) return;

    // Don't cut off previous clip — let it finish naturally for denser sound
    if (audioRef.current && !audioRef.current.ended) {
      // If previous clip is still playing, skip to avoid overlap
      // but allow rapid successive clips
    }

    const result = animaleseRef.current.Animalese(newChunk, true, 1.2);
    const audio = new Audio(result.dataURI);
    audio.volume = 0.3;
    audio.playbackRate = 1.4;
    audio.play().catch(() => {});
    audioRef.current = audio;
  }, [streamingText, isSpeaking]);

  // Stop when speaking ends
  useEffect(() => {
    if (!isSpeaking && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      lastLengthRef.current = 0;
    }
  }, [isSpeaking]);
}
