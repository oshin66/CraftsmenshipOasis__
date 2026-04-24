/**
 * Converts a File object to a base64 string
 */
export async function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Validates file size (default 5MB)
 */
export function validateFileSize(file: File, maxMb = 5): boolean {
  const maxSize = maxMb * 1024 * 1024;
  return file.size <= maxSize;
}
