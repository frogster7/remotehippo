"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getJobBySlug } from "@/lib/jobs";
import { createSignedCvUrl } from "@/lib/storage";
import { sendApplicationNotification } from "@/lib/email";

export async function submitApplication(
  slug: string,
  formData: {
    applicant_name: string;
    applicant_last_name: string;
    applicant_email: string;
    applicant_phone: string;
    cover_letter_text?: string | null;
  }
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/jobs/${slug}/apply`);
  }

  const job = await getJobBySlug(slug);
  if (!job || job.closed_at) {
    return { error: "This job is no longer accepting applications." };
  }
  if (!job.application_email || job.employer?.application_preference !== "email") {
    return { error: "Applications are not accepted through this form." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, last_name, phone_number, cv_file_url")
    .eq("id", user.id)
    .single();

  const cvPath = profile?.cv_file_url ?? null;
  if (!cvPath) {
    return { error: "Please add a CV in your profile before applying." };
  }

  const name = (formData.applicant_name ?? "").trim();
  const lastName = (formData.applicant_last_name ?? "").trim();
  const email = (formData.applicant_email ?? "").trim();
  const phone = (formData.applicant_phone ?? "").trim();
  if (!name || !lastName || !email) {
    return { error: "Name, last name, and email are required." };
  }

  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", job.id)
    .eq("applicant_id", user.id)
    .maybeSingle();
  if (existing) {
    return { error: "You have already applied to this job." };
  }

  const { url: cvDownloadUrl, error: urlError } = await createSignedCvUrl(
    supabase,
    cvPath,
    24 * 3600
  );
  if (urlError) {
    return { error: "Could not prepare CV link. Please try again." };
  }

  const { error: insertError } = await supabase.from("applications").insert({
    job_id: job.id,
    applicant_id: user.id,
    applicant_name: name,
    applicant_last_name: lastName,
    applicant_email: email,
    applicant_phone: phone || "",
    cv_url: cvPath,
    cover_letter_text: (formData.cover_letter_text ?? "").trim() || null,
    status: "pending",
  });
  if (insertError) {
    return { error: insertError.message };
  }

  const emailError = await sendApplicationNotification({
    to: job.application_email,
    jobTitle: job.title,
    companyName:
      job.employer?.company_name ?? job.employer?.full_name ?? "Company",
    applicantName: name,
    applicantLastName: lastName,
    applicantEmail: email,
    applicantPhone: phone,
    coverLetter: (formData.cover_letter_text ?? "").trim() || null,
    cvDownloadUrl: cvDownloadUrl || null,
  });
  if (emailError.error) {
    // Application is saved; log email failure but don't fail the action
    console.error("[apply] Failed to send notification email:", emailError.error);
  }

  return { error: null };
}
