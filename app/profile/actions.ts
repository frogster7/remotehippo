"use server";

import { createClient } from "@/lib/supabase/server";
import {
  uploadCv,
  uploadLogo,
  deleteStorageFile,
  CV_BUCKET,
  LOGO_BUCKET,
} from "@/lib/storage";

export type ProfileUpdateData = {
  full_name: string | null;
  last_name: string | null;
  phone_number: string | null;
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isEmployer = profile?.role === "employer";

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      last_name: data.last_name,
      phone_number: data.phone_number,
      company_name: isEmployer ? data.company_name : null,
      company_website: isEmployer ? data.company_website : null,
      company_about: isEmployer ? data.company_about : null,
      company_location: isEmployer ? data.company_location : null,
      application_preference: isEmployer ? data.application_preference : null,
    })
    .eq("id", user.id);

  return { error: error?.message ?? null };
}

const MAX_CVS_PER_USER = 3;

export async function addCvToUserCvs(
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { count } = await supabase
    .from("user_cvs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if ((count ?? 0) >= MAX_CVS_PER_USER) {
    return { error: `You can have at most ${MAX_CVS_PER_USER} CVs. Delete one to add another.` };
  }

  const file = formData.get("file") as File | null;
  if (!file?.size) return { error: "No file provided." };

  const { path, error: uploadError } = await uploadCv(supabase, user.id, file);
  if (uploadError) return { error: uploadError };

  const { error: insertError } = await supabase.from("user_cvs").insert({
    user_id: user.id,
    storage_path: path,
  });

  return { error: insertError?.message ?? null };
}

export async function deleteCvFromUserCvs(cvId: string): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: row } = await supabase
    .from("user_cvs")
    .select("storage_path")
    .eq("id", cvId)
    .eq("user_id", user.id)
    .single();
  if (!row) return { error: "CV not found." };

  const { error: delError } = await deleteStorageFile(
    supabase,
    CV_BUCKET,
    row.storage_path
  );
  if (delError) return { error: delError };

  const { error: deleteError } = await supabase
    .from("user_cvs")
    .delete()
    .eq("id", cvId)
    .eq("user_id", user.id);

  return { error: deleteError?.message ?? null };
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

