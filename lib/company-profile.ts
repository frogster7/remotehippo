import { createClient } from "@/lib/supabase/server";
import type {
  CompanyBenefit,
  CompanyExperience,
  CompanyHiringStep,
  CompanyGalleryItem,
} from "@/lib/types";

/** Company banners for profile/job pages. Uses company_banners table. */
export async function getCompanyBanners(employerId: string): Promise<
  { id: string; url: string }[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_banners")
    .select("id, url")
    .eq("employer_id", employerId)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((b) => ({ id: b.id, url: b.url }));
}

/** Company benefits (employer-defined). */
export async function getCompanyBenefits(
  employerId: string
): Promise<CompanyBenefit[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_benefits")
    .select("id, employer_id, title, description, display_order, created_at")
    .eq("employer_id", employerId)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CompanyBenefit[];
}

/** Company experiences (user reviews) – public: approved only. */
export async function getCompanyExperiences(
  employerId: string
): Promise<CompanyExperience[]> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("company_experiences")
    .select(`
      id, employer_id, author_id, content, status, created_at,
      profiles!author_id(full_name)
    `)
    .eq("employer_id", employerId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return ((rows ?? []) as unknown as Array<
    Omit<CompanyExperience, "author_name"> & {
      profiles: { full_name: string | null } | { full_name: string | null }[] | null;
    }
  >).map(({ profiles, ...rest }) => {
    const p = Array.isArray(profiles) ? profiles[0] : profiles;
    return { ...rest, author_name: p?.full_name ?? null };
  });
}

/** Company experiences for employer moderation – all (including pending). */
export async function getCompanyExperiencesForEmployer(
  employerId: string
): Promise<CompanyExperience[]> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("company_experiences")
    .select(`
      id, employer_id, author_id, content, status, created_at,
      profiles!author_id(full_name)
    `)
    .eq("employer_id", employerId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return ((rows ?? []) as unknown as Array<
    Omit<CompanyExperience, "author_name"> & {
      profiles: { full_name: string | null } | { full_name: string | null }[] | null;
    }
  >).map(({ profiles, ...rest }) => {
    const p = Array.isArray(profiles) ? profiles[0] : profiles;
    return { ...rest, author_name: p?.full_name ?? null };
  });
}

/** Company hiring process steps. */
export async function getCompanyHiringSteps(
  employerId: string
): Promise<CompanyHiringStep[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_hiring_steps")
    .select("id, employer_id, title, description, step_order, created_at")
    .eq("employer_id", employerId)
    .order("step_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CompanyHiringStep[];
}

/** Company gallery images. */
export async function getCompanyGallery(
  employerId: string
): Promise<CompanyGalleryItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_gallery")
    .select("id, employer_id, url, caption, display_order, created_at")
    .eq("employer_id", employerId)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CompanyGalleryItem[];
}
