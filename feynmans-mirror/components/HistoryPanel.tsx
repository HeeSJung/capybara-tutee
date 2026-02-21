'use client';

import { useEffect, useRef } from 'react';
import type { Message } from '@/lib/types';

interface HistoryPanelProps {
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryPanel({ messages, isOpen, onClose }: HistoryPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 z-[60] h-full w-[340px] overflow-hidden bg-white shadow-lg flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Conversation History"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E0D8]">
          <h2 className="type-h2 text-cocoa">Conversation History</h2>
          <button
            onClick={onClose}
            className="p-1 text-warm-gray hover:text-cocoa transition-colors"
            aria-label="Close history panel"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-4">
          {messages.length === 0 ? (
            <p className="type-body text-warm-gray text-center mt-8">
              No messages yet. Start teaching Capy!
            </p>
          ) : (
            messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div key={message.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <span className="type-caption text-warm-gray mb-1">
                    {isUser ? 'You' : 'Capy'}
                  </span>
                  {isUser ? (
                    <div className="text-sm rounded-[12px] bg-[#f3f3f0] px-3 py-2 max-w-[80%] break-words text-cocoa">
                      {message.content}
                    </div>
                  ) : (
                    <div className="text-sm max-w-[80%] break-words text-cocoa">
                      {message.content}
                    </div>
                  )}
                  <span className="type-caption text-light-gray mt-1">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
}
