"use server";

import { createClient } from "@/lib/supabase/server";
import {
  uploadCv,
  uploadCoverLetter,
  uploadLogo,
  uploadBanner,
  uploadGalleryImage,
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

const MAX_COVER_LETTERS_PER_USER = 5;

export async function addCoverLetterToUser(
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { count } = await supabase
    .from("user_cover_letters")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if ((count ?? 0) >= MAX_COVER_LETTERS_PER_USER) {
    return { error: `You can have at most ${MAX_COVER_LETTERS_PER_USER} cover letters. Delete one to add another.` };
  }

  const file = formData.get("file") as File | null;
  if (!file?.size) return { error: "No file provided." };

  const { path, error: uploadError } = await uploadCoverLetter(
    supabase,
    user.id,
    file
  );
  if (uploadError) return { error: uploadError };

  const { error: insertError } = await supabase
    .from("user_cover_letters")
    .insert({ user_id: user.id, storage_path: path });

  return { error: insertError?.message ?? null };
}

export async function deleteCoverLetterFromUser(
  coverLetterId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: row } = await supabase
    .from("user_cover_letters")
    .select("storage_path")
    .eq("id", coverLetterId)
    .eq("user_id", user.id)
    .single();
  if (!row) return { error: "Cover letter not found." };

  const { error: delError } = await deleteStorageFile(
    supabase,
    CV_BUCKET,
    row.storage_path
  );
  if (delError) return { error: delError };

  const { error: deleteError } = await supabase
    .from("user_cover_letters")
    .delete()
    .eq("id", coverLetterId)
    .eq("user_id", user.id);

  return { error: deleteError?.message ?? null };
}

export async function setDefaultCv(cvId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: row } = await supabase
    .from("user_cvs")
    .select("id")
    .eq("id", cvId)
    .eq("user_id", user.id)
    .single();
  if (!row) return { error: "CV not found." };

  await supabase.from("user_cvs").update({ is_default: false }).eq("user_id", user.id);
  const { error } = await supabase.from("user_cvs").update({ is_default: true }).eq("id", cvId);
  return { error: error?.message ?? null };
}

export async function setDefaultCoverLetter(clId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: row } = await supabase
    .from("user_cover_letters")
    .select("id")
    .eq("id", clId)
    .eq("user_id", user.id)
    .single();
  if (!row) return { error: "Cover letter not found." };

  await supabase.from("user_cover_letters").update({ is_default: false }).eq("user_id", user.id);
  const { error } = await supabase.from("user_cover_letters").update({ is_default: true }).eq("id", clId);
  return { error: error?.message ?? null };
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

const MAX_BANNERS_PER_EMPLOYER = 3;

export async function addBanner(formData: FormData): Promise<{
  error: string | null;
}> {
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
  if (profile?.role !== "employer") return { error: "Employers only." };

  const { count } = await supabase
    .from("company_banners")
    .select("id", { count: "exact", head: true })
    .eq("employer_id", user.id);
  if ((count ?? 0) >= MAX_BANNERS_PER_EMPLOYER) {
    return { error: `You can have at most ${MAX_BANNERS_PER_EMPLOYER} banners.` };
  }

  const file = formData.get("file") as File | null;
  if (!file?.size) return { error: "No file provided." };

  const { url, error: uploadError } = await uploadBanner(supabase, user.id, file);
  if (uploadError) return { error: uploadError };

  const maxOrder = await supabase
    .from("company_banners")
    .select("display_order")
    .eq("employer_id", user.id)
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrder.data?.display_order ?? -1) + 1;

  const { error: insertError } = await supabase.from("company_banners").insert({
    employer_id: user.id,
    url,
    display_order: nextOrder,
  });

  return { error: insertError?.message ?? null };
}

export async function deleteBanner(bannerId: string): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: row } = await supabase
    .from("company_banners")
    .select("id, url")
    .eq("id", bannerId)
    .eq("employer_id", user.id)
    .single();
  if (!row) return { error: "Banner not found." };

  const path = (() => {
    const match = (row.url as string).match(/\/company-logos\/(.+)$/);
    return match ? match[1] : null;
  })();
  if (path) {
    const { error: delError } = await deleteStorageFile(
      supabase,
      LOGO_BUCKET,
      path
    );
    if (delError) return { error: delError };
  }

  const { error: deleteError } = await supabase
    .from("company_banners")
    .delete()
    .eq("id", bannerId)
    .eq("employer_id", user.id);

  return { error: deleteError?.message ?? null };
}

// -----------------------------------------------------------------------------
// Company benefits
// -----------------------------------------------------------------------------
const MAX_BENEFITS = 12;

export async function addBenefit(formData: FormData): Promise<{
  error: string | null;
}> {
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
  if (profile?.role !== "employer") return { error: "Employers only." };

  const { count } = await supabase
    .from("company_benefits")
    .select("id", { count: "exact", head: true })
    .eq("employer_id", user.id);
  if ((count ?? 0) >= MAX_BENEFITS) {
    return { error: `You can add up to ${MAX_BENEFITS} benefits.` };
  }

  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Title is required." };

  const description = (formData.get("description") as string)?.trim() || null;

  const { data: maxRow } = await supabase
    .from("company_benefits")
    .select("display_order")
    .eq("employer_id", user.id)
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxRow?.display_order ?? -1) + 1;

  const { error } = await supabase.from("company_benefits").insert({
    employer_id: user.id,
    title,
    description,
    display_order: nextOrder,
  });

  return { error: error?.message ?? null };
}

export async function updateBenefit(
  benefitId: string,
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Title is required." };
  const description = (formData.get("description") as string)?.trim() || null;

  const { error } = await supabase
    .from("company_benefits")
    .update({ title, description })
    .eq("id", benefitId)
    .eq("employer_id", user.id);

  return { error: error?.message ?? null };
}

export async function deleteBenefit(benefitId: string): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("company_benefits")
    .delete()
    .eq("id", benefitId)
    .eq("employer_id", user.id);

  return { error: error?.message ?? null };
}

// -----------------------------------------------------------------------------
// Company hiring steps
// -----------------------------------------------------------------------------
const MAX_HIRING_STEPS = 10;

export async function addHiringStep(formData: FormData): Promise<{
  error: string | null;
}> {
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
  if (profile?.role !== "employer") return { error: "Employers only." };

  const { count } = await supabase
    .from("company_hiring_steps")
    .select("id", { count: "exact", head: true })
    .eq("employer_id", user.id);
  if ((count ?? 0) >= MAX_HIRING_STEPS) {
    return { error: `You can add up to ${MAX_HIRING_STEPS} hiring steps.` };
  }

  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Title is required." };

  const description = (formData.get("description") as string)?.trim() || null;

  const { data: maxRow } = await supabase
    .from("company_hiring_steps")
    .select("step_order")
    .eq("employer_id", user.id)
    .order("step_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxRow?.step_order ?? -1) + 1;

  const { error } = await supabase.from("company_hiring_steps").insert({
    employer_id: user.id,
    title,
    description,
    step_order: nextOrder,
  });

  return { error: error?.message ?? null };
}

export async function updateHiringStep(
  stepId: string,
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Title is required." };
  const description = (formData.get("description") as string)?.trim() || null;

  const { error } = await supabase
    .from("company_hiring_steps")
    .update({ title, description })
    .eq("id", stepId)
    .eq("employer_id", user.id);

  return { error: error?.message ?? null };
}

export async function deleteHiringStep(stepId: string): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("company_hiring_steps")
    .delete()
    .eq("id", stepId)
    .eq("employer_id", user.id);

  return { error: error?.message ?? null };
}

// -----------------------------------------------------------------------------
// Company gallery
// -----------------------------------------------------------------------------
const MAX_GALLERY_IMAGES = 12;

export async function addGalleryImage(formData: FormData): Promise<{
  error: string | null;
}> {
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
  if (profile?.role !== "employer") return { error: "Employers only." };

  const { count } = await supabase
    .from("company_gallery")
    .select("id", { count: "exact", head: true })
    .eq("employer_id", user.id);
  if ((count ?? 0) >= MAX_GALLERY_IMAGES) {
    return { error: `You can add up to ${MAX_GALLERY_IMAGES} gallery images.` };
  }

  const file = formData.get("file") as File | null;
  if (!file?.size) return { error: "No image provided." };

  const { url, error: uploadError } = await uploadGalleryImage(
    supabase,
    user.id,
    file
  );
  if (uploadError) return { error: uploadError };

  const caption = (formData.get("caption") as string)?.trim() || null;

  const { data: maxRow } = await supabase
    .from("company_gallery")
    .select("display_order")
    .eq("employer_id", user.id)
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxRow?.display_order ?? -1) + 1;

  const { error } = await supabase.from("company_gallery").insert({
    employer_id: user.id,
    url,
    caption,
    display_order: nextOrder,
  });

  return { error: error?.message ?? null };
}

export async function updateGalleryCaption(
  galleryId: string,
  caption: string | null
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("company_gallery")
    .update({ caption })
    .eq("id", galleryId)
    .eq("employer_id", user.id);

  return { error: error?.message ?? null };
}

export async function deleteGalleryImage(galleryId: string): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: row } = await supabase
    .from("company_gallery")
    .select("id, url")
    .eq("id", galleryId)
    .eq("employer_id", user.id)
    .single();
  if (!row) return { error: "Image not found." };

  const path = (() => {
    const match = (row.url as string).match(/\/company-logos\/(.+)$/);
    return match ? match[1] : null;
  })();
  if (path) {
    const { error: delError } = await deleteStorageFile(
      supabase,
      LOGO_BUCKET,
      path
    );
    if (delError) return { error: delError };
  }

  const { error } = await supabase
    .from("company_gallery")
    .delete()
    .eq("id", galleryId)
    .eq("employer_id", user.id);

  return { error: error?.message ?? null };
}
