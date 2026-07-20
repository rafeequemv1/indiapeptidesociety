/**
 * Upload abstract to Supabase Storage (call after VITE_DATA_SOURCE=supabase).
 * Bucket: symposium-abstracts (see migrations).
 */
import { getSupabaseClient } from "./client";
import { abstractStoragePath } from "../../lib/abstract-file";

export async function uploadAbstractToSupabase(
  registrationId: string,
  file: File,
): Promise<{ path: string }> {
  const path = abstractStoragePath(registrationId, file.name);
  const client = getSupabaseClient();
  const { error } = await client.storage.from("symposium-abstracts").upload(path, file, {
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });
  if (error) throw error;
  return { path };
}

export async function getAbstractSignedUrl(path: string, expiresIn = 3600): Promise<string> {
  const client = getSupabaseClient();
  const { data, error } = await client.storage
    .from("symposium-abstracts")
    .createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) throw error ?? new Error("No signed URL");
  return data.signedUrl;
}
