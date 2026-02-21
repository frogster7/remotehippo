/**
 * Supabase Storage helpers for user CVs and company logos.
 * Buckets: user-cvs (private), company-logos (public).
 * Path convention: {userId}/{uniqueId}-{originalName}
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export const CV_BUCKET = "user-cvs";
export const LOGO_BUCKET = "company-logos";

/** Max file size: 10 MB for CVs */
export const CV_MAX_BYTES = 10 * 1024 * 1024;

/** Max file size: 2 MB for logos */
export const LOGO_MAX_BYTES = 2 * 1024 * 1024;

/** Allowed MIME types for CV uploads */
export const CV_ALLOWED_TYPES = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

/** Allowed MIME types for logo uploads */
export const LOGO_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/** Allowed extensions for CV (for client-side validation) */
export const CV_ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

/** Allowed extensions for logos */
export const LOGO_ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

export function isAllowedCvType(mimeType: string): boolean {
  return CV_ALLOWED_TYPES.includes(mimeType);
}

export function isAllowedLogoType(mimeType: string): boolean {
  return LOGO_ALLOWED_TYPES.includes(mimeType);
}

/** Check by extension when file.type is empty (e.g. some mobile browsers) */
export function isAllowedCvFileName(fileName: string): boolean {
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  return CV_ALLOWED_EXTENSIONS.includes(ext);
}

export function isAllowedLogoFileName(fileName: string): boolean {
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  return LOGO_ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Generate a unique storage path: {userId}/{timestamp}-{sanitizedFileName}
 */
function makePath(userId: string, file: File): string {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const unique = `${Date.now()}-${safeName}`;
  return `${userId}/${unique}`;
}

/** Cover letter path: {userId}/cover-letters/{timestamp}-{filename} */
function makeCoverLetterPath(userId: string, file: File): string {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const unique = `${Date.now()}-${safeName}`;
  return `${userId}/cover-letters/${unique}`;
}

/**
 * Upload a CV to user-cvs bucket. Returns the path to store in profile (private bucket).
 * Caller must be authenticated as userId.
 */
export async function uploadCv(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<{ path: string; error: string | null }> {
  if (file.size > CV_MAX_BYTES) {
    return { path: "", error: "File must be 10 MB or smaller." };
  }
  if (!isAllowedCvType(file.type)) {
    return {
      path: "",
      error: "Only PDF, DOC, and DOCX files are allowed.",
    };
  }

  const path = makePath(userId, file);
  const { error } = await supabase.storage.from(CV_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (error) return { path: "", error: error.message };
  return { path, error: null };
}

/**
 * Upload a cover letter to user-cvs bucket (subfolder cover-letters).
 * Same validation as CVs: PDF, DOC, DOCX, max 10 MB.
 */
export async function uploadCoverLetter(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<{ path: string; error: string | null }> {
  if (file.size > CV_MAX_BYTES) {
    return { path: "", error: "File must be 10 MB or smaller." };
  }
  if (!isAllowedCvType(file.type)) {
    return {
      path: "",
      error: "Only PDF, DOC, and DOCX files are allowed.",
    };
  }
  const path = makeCoverLetterPath(userId, file);
  const { error } = await supabase.storage.from(CV_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (error) return { path: "", error: error.message };
  return { path, error: null };
}

/**
 * Upload a company logo to company-logos bucket. Returns the public URL.
 * Caller must be authenticated as userId.
 */
export async function uploadLogo(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<{ url: string; error: string | null }> {
  if (file.size > LOGO_MAX_BYTES) {
    return { url: "", error: "Image must be 2 MB or smaller." };
  }
  if (!isAllowedLogoType(file.type)) {
    return {
      url: "",
      error: "Only JPG, PNG, WebP, and GIF images are allowed.",
    };
  }

  const path = makePath(userId, file);
  const { error } = await supabase.storage.from(LOGO_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (error) return { url: "", error: error.message };

  const { data: urlData } = supabase.storage
    .from(LOGO_BUCKET)
    .getPublicUrl(path);
  return { url: urlData.publicUrl, error: null };
}

/**
 * Delete a file from a bucket. Path must be the full path (e.g. userId/filename).
 */
export async function deleteStorageFile(
  supabase: SupabaseClient,
  bucketId: string,
  path: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.storage.from(bucketId).remove([path]);
  return { error: error?.message ?? null };
}

/**
 * Get public URL for a file in a public bucket (e.g. company-logos).
 */
export function getPublicUrl(
  supabaseUrl: string,
  bucketId: string,
  path: string
): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucketId}/${path}`;
}

/**
 * Create a signed URL for a private bucket file (e.g. user-cvs).
 * Use from server only; expiresIn in seconds (e.g. 3600 = 1 hour).
 */
export async function createSignedCvUrl(
  supabase: SupabaseClient,
  path: string,
  expiresIn = 3600
): Promise<{ url: string; error: string | null }> {
  const { data, error } = await supabase.storage
    .from(CV_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) return { url: "", error: error.message };
  return { url: data.signedUrl, error: null };
}
