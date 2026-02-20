export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid pdf-parse trying to load test data at module evaluation
    const pdf = (await import('pdf-parse')).default;
    const data = await pdf(buffer);
    return data.text;
  } catch {
    throw new Error('Failed to extract text from PDF. The file may be corrupted or password-protected.');
  }
}
