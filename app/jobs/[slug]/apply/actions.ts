"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getJobBySlug } from "@/lib/jobs";
import { createSignedCvUrl, uploadCv } from "@/lib/storage";
import { sendApplicationNotification } from "@/lib/email";

export type SubmitApplicationResult = {
  error: string | null;
  emailSent?: boolean;
  emailError?: string | null;
};

export async function submitApplication(
  slug: string,
  formData: FormData
): Promise<SubmitApplicationResult> {
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

  const name = String(formData.get("applicant_name") ?? "").trim();
  const lastName = String(formData.get("applicant_last_name") ?? "").trim();
  const email = String(formData.get("applicant_email") ?? "").trim();
  const phone = String(formData.get("applicant_phone") ?? "").trim();
  const coverLetterText = String(formData.get("cover_letter_text") ?? "").trim() || null;
  if (!name || !lastName || !email) {
    return { error: "Name, last name, and email are required." };
  }

  const cvFile = formData.get("cv_file") as File | null;
  const chosenCvPath = formData.get("cv_path") ? String(formData.get("cv_path")).trim() : null;

  let cvPath: string | null = null;

  if (cvFile?.size && cvFile.size > 0) {
    const { path, error: uploadError } = await uploadCv(supabase, user.id, cvFile);
    if (uploadError) return { error: uploadError };
    cvPath = path;
  } else if (chosenCvPath) {
    const { data: row } = await supabase
      .from("user_cvs")
      .select("storage_path")
      .eq("user_id", user.id)
      .eq("storage_path", chosenCvPath)
      .single();
    if (row) cvPath = row.storage_path;
  }

  if (!cvPath) {
    const { data: firstCv } = await supabase
      .from("user_cvs")
      .select("storage_path")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();
    cvPath = firstCv?.storage_path ?? null;
  }

  if (!cvPath) {
    return { error: "Please choose a saved CV or upload a file for this application." };
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
    cover_letter_text: coverLetterText,
    status: "pending",
  });
  if (insertError) {
    return { error: insertError.message };
  }

  const emailResult = await sendApplicationNotification({
    to: job.application_email,
    jobTitle: job.title,
    companyName:
      job.employer?.company_name ?? job.employer?.full_name ?? "Company",
    applicantName: name,
    applicantLastName: lastName,
    applicantEmail: email,
    applicantPhone: phone,
    coverLetter: coverLetterText,
    cvDownloadUrl: cvDownloadUrl || null,
  });
  if (emailResult.error) {
    console.error("[apply] Failed to send notification email:", emailResult.error);
  }

  const emailSent = !emailResult.skipped && !emailResult.error;
  return {
    error: null,
    emailSent,
    emailError: emailResult.error ?? null,
  };
}
