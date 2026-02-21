'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-context';
import { setStoredFile } from '@/lib/file-store';
import FileUpload from '@/components/FileUpload';

export default function Home() {
  const router = useRouter();
  const { setSourceData, setScreen } = useSession();

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [error, setError] = useState('');

  function handleFileSelect(file: File | null) {
    setPdfFile(file);
    if (file) {
      setPastedText('');
      setStoredFile(file);
    } else {
      setStoredFile(null);
    }
    setError('');
  }

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    setPastedText(text);
    if (text.length > 0) {
      setPdfFile(null);
      setStoredFile(null);
    }
    setError('');
  }

  function handleContinue() {
    if (!pdfFile && pastedText.trim().length === 0) {
      setError('Please upload a PDF or paste your notes to get started.');
      return;
    }

    if (!pdfFile && pastedText.length < 500) {
      setError(
        'Your source material is too short. Please provide more detailed notes (at least a few paragraphs).',
      );
      return;
    }

    setSourceData({
      sourceText: pastedText,
      sourceType: pdfFile ? 'pdf' : 'text',
      fileName: pdfFile?.name,
      characterCount: pastedText.length,
    });

    setScreen('topic');
    router.push('/topic');
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="w-full max-w-[800px] px-8 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="type-h1 text-cocoa">Feynman&apos;s Mirror</h1>
          <p className="type-body mt-2 text-warm-gray">
            Teach Capy what you&apos;ve learned. Prove you understand.
          </p>
        </div>

        {/* Upload Area */}
        <FileUpload file={pdfFile} onFileSelect={handleFileSelect} />

        {/* Divider */}
        <div className="my-6 text-center">
          <span className="type-body text-light-gray">&mdash; or &mdash;</span>
        </div>

        {/* Text Paste Box */}
        <textarea
          value={pastedText}
          onChange={handleTextChange}
          placeholder="Paste your notes here..."
          className="type-body w-full min-h-[160px] resize-none rounded-[12px] border-2 border-[#E8E0D8] bg-white p-4 text-cocoa placeholder:text-light-gray focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-colors"
        />

        {/* Character count hint */}
        {pastedText.length > 0 && pastedText.length < 500 && (
          <p className="type-caption mt-1 text-light-gray">
            {pastedText.length} / 500 characters minimum
          </p>
        )}

        {/* Continue Button */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={handleContinue}
            className="type-button rounded-[12px] bg-terracotta px-6 py-3 text-on-accent shadow-sm transition-all hover:bg-[#d06a50] hover:shadow-md"
          >
            Continue &rarr;
          </button>

          {error && (
            <p className="type-body max-w-md text-center text-error">{error}</p>
          )}
        </div>
      </main>
    </div>
  );
}
