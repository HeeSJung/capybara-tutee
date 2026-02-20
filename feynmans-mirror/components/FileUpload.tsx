'use client';

import { useRef, useState, useCallback } from 'react';

interface FileUploadProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export default function FileUpload({ file, onFileSelect, disabled }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (f: File) => {
      if (f.type !== 'application/pdf') return;
      onFileSelect(f);
    },
    [onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      if (disabled) return;
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [disabled, handleFile],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setDragOver(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleRemove = useCallback(() => {
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [onFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled && !file) inputRef.current?.click();
  }, [disabled, file]);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      {file ? (
        <div className="flex items-center justify-between rounded-[12px] border-2 border-[#E8E0D8] bg-white p-6">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M16.667 5L7.5 14.167 3.333 10" stroke="#4CAF7D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="type-body font-semibold text-[#2D2A24]">{file.name}</span>
          </div>
          <button type="button" onClick={handleRemove} className="type-caption text-[#7A7568] transition-colors hover:text-[#E07A5F]">
            Remove
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed p-8 transition-colors ${
            dragOver
              ? 'border-[#E07A5F] bg-[#E07A5F]/5'
              : 'border-[#E8E0D8] bg-white hover:border-[#B5AFA6]'
          } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mb-3" aria-hidden="true">
            <path d="M16 20V8m0 0-4 4m4-4 4 4M6 22v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2" stroke="#B5AFA6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="type-body font-semibold text-[#2D2A24]">Upload PDF</p>
          <p className="mt-1 type-caption text-[#7A7568]">Drag & drop your lecture notes here</p>
          <p className="mt-2 type-caption text-[#B5AFA6]">or click to browse</p>
        </div>
      )}
    </div>
  );
}
