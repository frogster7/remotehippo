"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateJobSlug } from "@/lib/jobs";
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
  const { supabase, userId } = await ensureEmployer();
  const slug = generateJobSlug(form.title.trim() || "job");
  const { error } = await supabase.from("jobs").insert({
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
    eu_timezone_friendly: form.eu_timezone_friendly,
    is_active: form.is_active,
  });
  if (error) return { error: error.message };
  revalidatePath("/employer/dashboard");
  revalidatePath("/jobs");
  redirect("/employer/dashboard");
}

export async function updateJob(
  jobId: string,
  form: JobFormData
): Promise<{ error?: string }> {
  const { supabase } = await ensureEmployer();
  const { data: job } = await supabase
    .from("jobs")
    .select("slug")
    .eq("id", jobId)
    .single();
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
      eu_timezone_friendly: form.eu_timezone_friendly,
      is_active: form.is_active,
    })
    .eq("id", jobId);
  if (error) return { error: error.message };
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
