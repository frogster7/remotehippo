"use server";

import { createClient } from "@/lib/supabase/server";
import {
  uploadCv,
  uploadLogo,
  deleteStorageFile,
  createSignedCvUrl,
  CV_BUCKET,
  LOGO_BUCKET,
} from "@/lib/storage";

export type ProfileUpdateData = {
  full_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  role: "employer" | "job_seeker";
  company_name: string | null;
  company_website: string | null;
  company_about: string | null;
  company_location: string | null;
  application_preference: "website" | "email" | null;
};

export async function updateProfile(
  data: ProfileUpdateData
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      last_name: data.last_name,
      phone_number: data.phone_number,
      role: data.role,
      company_name: data.role === "employer" ? data.company_name : null,
      company_website: data.role === "employer" ? data.company_website : null,
      company_about: data.role === "employer" ? data.company_about : null,
      company_location: data.role === "employer" ? data.company_location : null,
      application_preference:
        data.role === "employer" ? data.application_preference : null,
    })
    .eq("id", user.id);

  return { error: error?.message ?? null };
}

export async function uploadCvAndUpdateProfile(
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const file = formData.get("file") as File | null;
  if (!file?.size) return { error: "No file provided." };

  const { path, error: uploadError } = await uploadCv(supabase, user.id, file);
  if (uploadError) return { error: uploadError };

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ cv_file_url: path })
    .eq("id", user.id);

  return { error: updateError?.message ?? null };
}

export async function deleteCvAndUpdateProfile(): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("cv_file_url")
    .eq("id", user.id)
    .single();

  const path = profile?.cv_file_url ?? null;
  if (path) {
    const { error: delError } = await deleteStorageFile(
      supabase,
      CV_BUCKET,
      path
    );
    if (delError) return { error: delError };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ cv_file_url: null })
    .eq("id", user.id);

  return { error: updateError?.message ?? null };
}

/** Extract storage path from company logo public URL (for delete). */
function getLogoPathFromUrl(logoUrl: string): string | null {
  const match = logoUrl.match(/\/company-logos\/(.+)$/);
  return match ? match[1] : null;
}

export async function uploadLogoAndUpdateProfile(
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const file = formData.get("file") as File | null;
  if (!file?.size) return { error: "No file provided." };

  const { url, error: uploadError } = await uploadLogo(
    supabase,
    user.id,
    file
  );
  if (uploadError) return { error: uploadError };

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ company_logo_url: url })
    .eq("id", user.id);

  return { error: updateError?.message ?? null };
}

export async function deleteLogoAndUpdateProfile(): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_logo_url")
    .eq("id", user.id)
    .single();

  const logoUrl = profile?.company_logo_url ?? null;
  if (logoUrl) {
    const path = getLogoPathFromUrl(logoUrl);
    if (path) {
      const { error: delError } = await deleteStorageFile(
        supabase,
        LOGO_BUCKET,
        path
      );
      if (delError) return { error: delError };
    }
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ company_logo_url: null })
    .eq("id", user.id);

  return { error: updateError?.message ?? null };
}

/** Create a signed URL for the current user's CV (e.g. for download link). */
export async function getSignedCvUrl(): Promise<{
  url: string | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { url: null, error: "Not authenticated." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("cv_file_url")
    .eq("id", user.id)
    .single();

  const path = profile?.cv_file_url ?? null;
  if (!path) return { url: null, error: null };

  const { url, error } = await createSignedCvUrl(supabase, path, 3600);
  return { url: error ? null : url, error };
}
