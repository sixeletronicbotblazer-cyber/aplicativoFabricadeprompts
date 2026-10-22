/**
 * Supabase client for the new project.
 * Used for storage operations (image/video uploads and retrieval).
 *
 * Project: kwlsuylcowdldtaqaaou
 * Bucket:  prompts-media (public)
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set. Storage features will be disabled."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** Storage bucket name */
export const STORAGE_BUCKET = "prompts-media";

/**
 * Get a public URL for a file in the prompts-media bucket.
 * @param path - File path within the bucket (e.g. "image/photo.jpg")
 */
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload a file to the prompts-media bucket.
 * @param path - Target path within the bucket
 * @param file - File data (Blob, File, or ArrayBuffer)
 * @param contentType - MIME type
 */
export async function uploadFile(
  path: string,
  file: Blob | File | ArrayBuffer,
  contentType: string = "image/jpeg"
) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) throw error;
  return data;
}

/**
 * List files in a given folder within the bucket.
 * @param prefix - Folder prefix (e.g. "image/")
 * @param limit - Max number of files to return
 */
export async function listFiles(prefix: string = "", limit: number = 100) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(prefix, { limit, sortBy: { column: "name", order: "asc" } });

  if (error) throw error;
  return data;
}
