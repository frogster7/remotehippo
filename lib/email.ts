/**
 * Send application notification to employer.
 * Uses Resend when RESEND_API_KEY is set; otherwise no-op (application still saved in DB).
 */

export type ApplicationEmailParams = {
  to: string;
  jobTitle: string;
  companyName: string;
  applicantName: string;
  applicantLastName: string;
  applicantEmail: string;
  applicantPhone: string;
  coverLetter: string | null;
  cvDownloadUrl: string | null;
};

export async function sendApplicationNotification(
  params: ApplicationEmailParams
): Promise<{ error: string | null }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { error: null }; // no-op when not configured
  }

  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";
  const {
    to,
    jobTitle,
    companyName,
    applicantName,
    applicantLastName,
    applicantEmail,
    applicantPhone,
    coverLetter,
    cvDownloadUrl,
  } = params;

  const lines: string[] = [
    `New application for: ${jobTitle}`,
    `Company: ${companyName}`,
    "",
    "Applicant:",
    `Name: ${applicantName} ${applicantLastName}`,
    `Email: ${applicantEmail}`,
    `Phone: ${applicantPhone}`,
    "",
  ];
  if (coverLetter?.trim()) {
    lines.push("Cover letter:", coverLetter.trim(), "");
  }
  if (cvDownloadUrl) {
    lines.push(`CV (download link, expires in 24h): ${cvDownloadUrl}`);
  }

  const body = lines.join("\n");

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: typeof from === "string" ? from : "onboarding@resend.dev",
      to: [to],
      subject: `Application: ${jobTitle} – ${applicantName} ${applicantLastName}`,
      text: body,
    });
    return { error: error?.message ?? null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }
}
