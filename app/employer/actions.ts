"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateJobSlug } from "@/lib/jobs";
import { notifyJobAlert } from "@/lib/notifications";
import type { JobFormData } from "@/lib/types";

async function ensureEmployer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/employer/dashboard");
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "employer") {
    redirect("/profile");
  }
  return { supabase, userId: user.id };
}

export async function createJob(form: JobFormData): Promise<{ error?: string }> {
  if (!form.summary?.trim()) return { error: "Summary is required." };
  const { supabase, userId } = await ensureEmployer();
  const slug = generateJobSlug(form.title.trim() || "job");
  const { data: inserted, error } = await supabase
    .from("jobs")
    .insert({
      employer_id: userId,
      title: form.title.trim() || "Untitled",
      slug,
      description: form.description.trim() || "",
      role: form.role.trim() || "Developer",
      work_type: form.work_type,
      job_type: form.job_type,
      tech_stack: form.tech_stack?.filter(Boolean) ?? [],
      salary_min: form.salary_min && form.salary_min > 0 ? form.salary_min : null,
      salary_max: form.salary_max && form.salary_max > 0 ? form.salary_max : null,
      location: form.location?.trim() || null,
      is_active: form.is_active,
      application_email: form.application_email?.trim() || null,
      application_url: form.application_url?.trim() || null,
      summary: form.summary?.trim() || null,
      responsibilities: form.responsibilities?.trim() || null,
      requirements: form.requirements?.trim() || null,
      what_we_offer: form.what_we_offer?.trim() || null,
      good_to_have: form.good_to_have?.trim() || null,
      benefits: form.benefits?.trim() || null,
      screening_questions: form.screening_questions ?? [],
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  if (form.is_active && inserted?.id) {
    await notifyJobAlert(inserted.id);
  }
  revalidatePath("/employer/dashboard");
  revalidatePath("/jobs");
  redirect("/employer/dashboard");
}

export async function updateJob(
  jobId: string,
  form: JobFormData
): Promise<{ error?: string }> {
  if (!form.summary?.trim()) return { error: "Summary is required." };
  const { supabase } = await ensureEmployer();
  const { data: job } = await supabase
    .from("jobs")
    .select("slug, is_active")
    .eq("id", jobId)
    .single();
  const wasActive = job?.is_active ?? false;
  const { error } = await supabase
    .from("jobs")
    .update({
      title: form.title.trim() || "Untitled",
      description: form.description.trim() || "",
      role: form.role.trim() || "Developer",
      work_type: form.work_type,
      job_type: form.job_type,
      tech_stack: form.tech_stack?.filter(Boolean) ?? [],
      salary_min: form.salary_min && form.salary_min > 0 ? form.salary_min : null,
      salary_max: form.salary_max && form.salary_max > 0 ? form.salary_max : null,
      location: form.location?.trim() || null,
      is_active: form.is_active,
      application_email: form.application_email?.trim() || null,
      application_url: form.application_url?.trim() || null,
      summary: form.summary?.trim() || null,
      responsibilities: form.responsibilities?.trim() || null,
      requirements: form.requirements?.trim() || null,
      what_we_offer: form.what_we_offer?.trim() || null,
      good_to_have: form.good_to_have?.trim() || null,
      benefits: form.benefits?.trim() || null,
      screening_questions: form.screening_questions ?? [],
    })
    .eq("id", jobId);
  if (error) return { error: error.message };
  if (form.is_active && !wasActive) {
    await notifyJobAlert(jobId);
  }
  revalidatePath("/employer/dashboard");
  revalidatePath("/jobs");
  if (job?.slug) revalidatePath(`/jobs/${job.slug}`);
  return {};
}

export async function deleteJob(jobId: string): Promise<{ error?: string }> {
  await ensureEmployer();
  const supabase = await createClient();
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);
  if (error) return { error: error.message };
  revalidatePath("/employer/dashboard");
  revalidatePath("/jobs");
  redirect("/employer/dashboard");
}

export async function closeJob(jobId: string): Promise<{ error?: string }> {
  const { supabase } = await ensureEmployer();
  const { error } = await supabase
    .from("jobs")
    .update({ closed_at: new Date().toISOString() })
    .eq("id", jobId);
  if (error) return { error: error.message };
  revalidatePath("/employer/dashboard");
  revalidatePath("/jobs");
  return {};
}

export async function reopenJob(jobId: string): Promise<{ error?: string }> {
  const { supabase } = await ensureEmployer();
  const { error } = await supabase
    .from("jobs")
    .update({ closed_at: null })
    .eq("id", jobId);
  if (error) return { error: error.message };
  revalidatePath("/employer/dashboard");
  revalidatePath("/jobs");
  return {};
}

/** Approve a pending experience/review (employer moderation). RLS ensures employer owns company. */
export async function approveExperience(
  experienceId: string
): Promise<{ error?: string }> {
  const { supabase } = await ensureEmployer();
  const { error } = await supabase
    .from("company_experiences")
    .update({ status: "approved" })
    .eq("id", experienceId);
  if (error) return { error: error.message };
  revalidatePath("/employer/dashboard");
  revalidatePath("/employer");
  return {};
}

/** Reject (delete) a pending experience. RLS ensures employer owns company. */
export async function rejectExperience(
  experienceId: string
): Promise<{ error?: string }> {
  await ensureEmployer();
  const supabase = await createClient();
  const { error } = await supabase
    .from("company_experiences")
    .delete()
    .eq("id", experienceId);
  if (error) return { error: error.message };
  revalidatePath("/employer/dashboard");
  revalidatePath("/employer");
  return {};
}
