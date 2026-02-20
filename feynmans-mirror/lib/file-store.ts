// Simple module-level store for the PDF file (can't serialize File to context)
let storedFile: File | null = null;

export function setStoredFile(file: File | null) {
  storedFile = file;
}

export function getStoredFile(): File | null {
  return storedFile;
}
