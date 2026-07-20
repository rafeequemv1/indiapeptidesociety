import type { GalleryImage } from "../../domain/types";
import { getSupabaseClient, isSupabaseConfigured } from "./client";

const BUCKET = "gallery";

export function galleryPublicUrl(path: string): string {
  const client = getSupabaseClient();
  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Upload image for staff; returns public URL + storage path. */
export async function uploadGalleryImage(
  file: File,
  id: string,
): Promise<{ url: string; path: string }> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${id}/${Date.now()}-${safeName}`;
  const client = getSupabaseClient();
  const { error } = await client.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || "image/jpeg",
  });
  if (error) throw error;
  return { url: galleryPublicUrl(path), path };
}

export async function removeGalleryImage(path: string): Promise<void> {
  if (!path || !isSupabaseConfigured()) return;
  const client = getSupabaseClient();
  await client.storage.from(BUCKET).remove([path]);
}

/** Persist gallery metadata row (staff RLS). */
export async function upsertGalleryRow(item: GalleryImage, sortOrder: number): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const client = getSupabaseClient();
  const { error } = await client.from("gallery_images").upsert({
    id: item.id,
    title: item.title,
    image_url: item.image,
    storage_path: item.storagePath ?? null,
    sort_order: sortOrder,
  });
  if (error) throw error;
}

export async function deleteGalleryRow(id: string): Promise<void> {
  if (!id || !isSupabaseConfigured()) return;
  const client = getSupabaseClient();
  const { error } = await client.from("gallery_images").delete().eq("id", id);
  if (error) throw error;
}
