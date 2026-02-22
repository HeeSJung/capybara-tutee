'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onDone: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSend,
  onDone,
  disabled = false,
  placeholder = 'Type your explanation...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 150) + 'px';
    }
  }, [message]);

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setMessage('');
  }, [message, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const isSendDisabled = disabled || message.trim().length === 0;

  return (
    <div className="flex items-center gap-3">
      <textarea
        ref={inputRef}
        rows={1}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        style={{ maxHeight: 150 }}
        className="
          type-body 
          flex-1 border-2 
          border-input-border 
          rounded-[12px] 
          bg-white 
          px-4 
          py-3 
          placeholder:text-light-gray 
          focus:border-terracotta 
          focus:outline-none 
          focus:ring-2 
          focus:ring-terracotta/20 
          disabled:opacity-50 
          resize-none 
          overflow-y-auto
          "
      />

      <button
        type="button"
        onClick={handleSend}
        disabled={isSendDisabled}
        className="type-button bg-terracotta text-on-accent rounded-[12px] px-5 py-3 hover:bg-terracotta-dark transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>

      <button
        type="button"
        onClick={onDone}
        disabled={disabled}
        className="type-button rounded-[12px] px-5 py-3 border-2 border-teal text-teal hover:bg-teal hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        I&apos;m Done
      </button>
    </div>
  );
}
