const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export interface AbstractFilePayload {
  fileName: string;
  mimeType: string;
  fileSize: number;
  dataUrl: string;
}

export function validateAbstractFile(file: File): string | null {
  if (file.size > MAX_BYTES) return "Abstract file must be 5 MB or smaller.";
  const okType =
    ALLOWED.has(file.type) ||
    /\.(pdf|docx?)$/i.test(file.name);
  if (!okType) return "Please upload a PDF or Word document (.pdf, .doc, .docx).";
  return null;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export async function fileToAbstractPayload(file: File): Promise<AbstractFilePayload> {
  const err = validateAbstractFile(file);
  if (err) throw new Error(err);
  const dataUrl = await readFileAsDataUrl(file);
  return {
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    fileSize: file.size,
    dataUrl,
  };
}

/** Path used in Supabase Storage bucket `symposium-abstracts`. */
export function abstractStoragePath(registrationId: string, fileName: string): string {
  const safe = fileName.replace(/[^\w.\-()+ ]+/g, "_").slice(0, 120);
  return `${registrationId}/${safe}`;
}
