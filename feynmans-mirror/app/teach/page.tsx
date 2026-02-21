'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-context';
import TuteeAvatar from '@/components/TuteeAvatar';
import ChatInput from '@/components/ChatInput';
import HistoryPanel from '@/components/HistoryPanel';
import type { TuteeState } from '@/lib/types';

export default function TeachPage() {
  const {
    state,
    addMessage,
    updateTuteeState,
    updateCoveredSubtopics,
    endConversation,
    setScreen,
  } = useSession();
  const router = useRouter();

  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState('');
  const [tuteeState, setTuteeState] = useState<TuteeState>('idle');
  const [greetingText, setGreetingText] = useState('');
  const [greetingDone, setGreetingDone] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const switchedToIdleRef = useRef(false);
  const isSpeaking = (isStreaming && streamingText.length > 0) || (!greetingDone && greetingText.length > 0);

  // Guard: redirect if no oracle data
  useEffect(() => {
    if (!state.oracle) {
      router.push('/');
    }
  }, [state.oracle, router]);

  // Switch from thinking to idle when first token arrives
  useEffect(() => {
    if (streamingText.length > 0 && tuteeState === 'thinking' && !switchedToIdleRef.current) {
      switchedToIdleRef.current = true;
      setTuteeState('idle');
      updateTuteeState('idle');
    }
  }, [streamingText, tuteeState, updateTuteeState]);

  // Typewriter effect for initial greeting
  useEffect(() => {
    if (!state.oracle || greetingDone) return;
    const fullGreeting = `Hi! I'm Capy! I'm ready to learn about ${state.source.subtopic}. Go ahead and teach me!`;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setGreetingText(fullGreeting.slice(0, i));
      if (i >= fullGreeting.length) {
        clearInterval(interval);
        setGreetingDone(true);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [state.oracle, state.source.subtopic, greetingDone]);

  // Auto-scroll chat to bottom on new messages or streaming
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [state.conversation.messages.length, streamingText, greetingText]);

  const handleSend = useCallback(
    async (message: string) => {
      if (!state.oracle) return;

      setStreamingText('');
      setIsStreaming(true);
      setTuteeState('thinking');
      updateTuteeState('thinking');
      switchedToIdleRef.current = false;
      setError('');

      // Add user message to context
      addMessage({
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        timestamp: new Date(),
      });

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            conversationHistory: state.conversation.messages,
            topicOutline: state.oracle.topicOutline,
            coveredSubtopics: state.conversation.coveredSubtopics,
          }),
        });

        if (!res.ok) {
          throw new Error('API request failed');
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
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (currentEvent === 'token') {
                  setStreamingText((prev) => prev + data.token);
                } else if (currentEvent === 'done') {
                  setTuteeState(data.state as TuteeState);
                  updateTuteeState(data.state as TuteeState);
                  updateCoveredSubtopics(data.coveredSubtopics);

                  addMessage({
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: data.message,
                    timestamp: new Date(),
                    tuteeState: data.state as TuteeState,
                  });

                  setIsStreaming(false);
                  setStreamingText('');
                }
              } catch {
                // Skip malformed JSON lines
              }
            }
          }
        }
      } catch {
        setError('Connection lost. Your session has been saved.');
        setIsStreaming(false);
        setStreamingText('');
        setTuteeState('idle');
      }
    },
    [state.oracle, state.conversation.messages, state.conversation.coveredSubtopics, addMessage, updateTuteeState, updateCoveredSubtopics],
  );

  const handleDone = useCallback(() => {
    setShowConfirmDialog(true);
  }, []);

  const handleConfirmDone = useCallback(() => {
    endConversation();
    setScreen('testing');
    router.push('/testing');
  }, [endConversation, setScreen, router]);

  if (!state.oracle) return null;

  return (
    <>
      <div className="flex h-screen w-full">
        {/* Left panel: Topic + Capy (fixed height, never scrolls) */}
        <div className="flex h-screen w-[35%] flex-col px-8 py-6">
          <h2 className="type-h2 mb-2 text-cocoa">
            Topic: {state.source.subtopic}
          </h2>

          {/* Subtopics to cover */}
          <div className="mb-4">
            <p className="type-body mb-2 font-semibold text-cocoa">Subtopics to cover:</p>
            <ul className="space-y-1.5">
              {state.oracle.topicOutline.map((item, i) => {
                const isCovered = state.conversation.coveredSubtopics.includes(item);
                return (
                  <li key={i} className={`type-body flex items-start gap-2 ${isCovered ? 'text-[#4CAF7D]' : 'text-warm-gray'}`}>
                    <span className="mt-0.5">{isCovered ? '\u2713' : '\u2022'}</span>
                    <span className={isCovered ? 'line-through opacity-60' : ''}>{item}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {error && (
            <div className="mb-4 flex items-center justify-between rounded-[12px] bg-error-bg px-4 py-3">
              <p className="type-body text-error">{error}</p>
              <button type="button" onClick={() => setError('')} className="type-button text-error underline">
                Dismiss
              </button>
            </div>
          )}

          <div className="flex flex-1 items-center justify-center pb-8" style={{ alignItems: 'flex-end' }}>
            <TuteeAvatar state={tuteeState} isSpeaking={isSpeaking} size={280} />
          </div>
        </div>

        {/* Right panel: Chat interface (fixed height, only messages scroll) */}
        <div className="flex h-screen w-[65%] flex-col border-l border-[#E8E0D8]">
          {/* Header */}
          <div className="flex items-center justify-end px-6 py-4 border-b border-[#E8E0D8]">
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="type-caption rounded-[8px] border border-[#E8E0D8] px-3 py-1.5 text-warm-gray transition-colors hover:border-terracotta hover:text-terracotta"
            >
              History &#9660;
            </button>
          </div>

          {/* Scrollable chat messages — document style */}
          <div ref={chatScrollRef} className="min-h-0 flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {/* Initial greeting (typewriter) */}
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bubble-tutee">
                <span className="text-xs leading-none">🦫</span>
              </div>
              <p className="type-body leading-relaxed text-cocoa">
                {greetingText}
                {!greetingDone && <span className="inline-block w-[2px] h-[1em] bg-cocoa/40 align-middle ml-0.5 animate-pulse" />}
              </p>
            </div>

            {/* All conversation messages */}
            {state.conversation.messages.map((msg) =>
              msg.role === 'user' ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[75%] rounded-[16px] bg-[#f3f3f0] px-5 py-3.5">
                    <p className="type-body leading-relaxed text-cocoa">{msg.content}</p>
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex items-start gap-3 max-w-[85%]">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bubble-tutee">
                    <span className="text-xs leading-none">🦫</span>
                  </div>
                  <p className="type-body leading-relaxed text-cocoa">{msg.content}</p>
                </div>
              ),
            )}

            {/* Streaming response */}
            {isStreaming && (
              <div className="flex items-start gap-3 max-w-[85%]">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bubble-tutee">
                  <span className="text-xs leading-none">🦫</span>
                </div>
                <p className="type-body leading-relaxed text-cocoa">
                  {streamingText || (
                    <span className="inline-flex gap-1 text-warm-gray">
                      <span className="animate-pulse">·</span>
                      <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>·</span>
                      <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>·</span>
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Input bar pinned to bottom */}
          <div className="border-t border-[#E8E0D8] px-6 py-4">
            <ChatInput
              onSend={handleSend}
              onDone={handleDone}
              disabled={isStreaming}
            />
          </div>
        </div>

        {/* History panel */}
        <HistoryPanel
          messages={state.conversation.messages}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      </div>

      {/* Confirmation dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-[480px] max-w-[calc(100vw-2rem)] rounded-[20px] bg-white p-8 shadow-lg">
            <h3 className="type-h2 mb-3 text-cocoa">Done teaching?</h3>
            <p className="type-body mb-6 text-warm-gray">
              Capy will now take a test based on what you taught. You won&apos;t
              be able to add more explanations after this.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleConfirmDone}
                className="type-button flex-1 rounded-[12px] bg-terracotta px-5 py-3 text-on-accent shadow-sm transition-all hover:bg-[#d06a50] hover:shadow-md"
              >
                Yes, grade my teaching
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                className="type-button flex-1 rounded-[12px] border-2 border-teal bg-white px-5 py-3 text-teal transition-all hover:bg-teal hover:text-white"
              >
                Keep teaching
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
