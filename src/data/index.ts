import type { ContentRepository } from "./repository";
import { createLocalRepository } from "./local/repository";
import { isSupabaseConfigured } from "./supabase/client";
import { createSupabaseRepository } from "./supabase/repository";

export type DataSource = "local" | "supabase";

/**
 * Active data source.
 * - local (default): browser localStorage — current behaviour
 * - supabase: set VITE_DATA_SOURCE=supabase + URL/anon key
 */
export function getDataSource(): DataSource {
  const raw = (import.meta.env.VITE_DATA_SOURCE as string | undefined)?.toLowerCase();
  if (raw === "supabase" && isSupabaseConfigured()) return "supabase";
  return "local";
}

let cached: ContentRepository | null = null;

export function getRepository(): ContentRepository {
  if (cached) return cached;
  cached = getDataSource() === "supabase" ? createSupabaseRepository() : createLocalRepository();
  return cached;
}

export type { ContentRepository } from "./repository";
