import { getDocumentProxy, extractText } from 'unpdf';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  } catch {
    throw new Error('Failed to extract text from PDF. The file may be corrupted or password-protected.');
  }
}
