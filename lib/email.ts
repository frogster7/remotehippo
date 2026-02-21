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
  coverLetterDownloadUrl?: string | null;
  cvDownloadUrl: string | null;
  screeningAnswers: {
    question_prompt: string;
    answer: string;
  }[];
};

export type SendApplicationResult =
  | { error: null; skipped?: false }
  | { error: string | null; skipped: true };

export async function sendApplicationNotification(
  params: ApplicationEmailParams
): Promise<{ error: string | null; skipped?: boolean }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[email] RESEND_API_KEY is not set – application emails will not be sent.");
    }
    return { error: null, skipped: true };
  }

  const from = (process.env.RESEND_FROM ?? "onboarding@resend.dev").trim();
  const {
    to,
    jobTitle,
    companyName,
    applicantName,
    applicantLastName,
    applicantEmail,
    applicantPhone,
    coverLetter,
    coverLetterDownloadUrl,
    cvDownloadUrl,
    screeningAnswers,
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
    lines.push("Cover letter (text):", coverLetter.trim(), "");
  }
  if (coverLetterDownloadUrl) {
    lines.push("Cover letter (attachment, download link, expires in 24h):", coverLetterDownloadUrl, "");
  }
  if (screeningAnswers.length > 0) {
    lines.push("Screening answers:");
    screeningAnswers.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.question_prompt}`);
      lines.push(`Answer: ${item.answer}`);
    });
    lines.push("");
  }
  if (cvDownloadUrl) {
    lines.push(`CV (download link, expires in 24h): ${cvDownloadUrl}`);
  }

  const body = lines.join("\n");

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: from || "onboarding@resend.dev",
      to: [to],
      subject: `Application: ${jobTitle} – ${applicantName} ${applicantLastName}`,
      text: body,
    });
    if (error) {
      const msg = typeof error === "object" && error !== null && "message" in error
        ? String((error as { message?: unknown }).message)
        : String(error);
      if (process.env.NODE_ENV === "development") {
        console.error("[email] Resend send failed:", msg, error);
      }
      return { error: msg || "Failed to send email" };
    }
    if (process.env.NODE_ENV === "development" && data?.id) {
      console.log("[email] Application notification sent, id:", data.id);
    }
    return { error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    if (process.env.NODE_ENV === "development") {
      console.error("[email] Resend exception:", err);
    }
    return { error: message };
  }
}
