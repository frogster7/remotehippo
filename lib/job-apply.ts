import type { Job } from "@/lib/types";

export type JobApplyProps = {
  isClosed: boolean;
  applyHref: string | null;
  applyLabel: string;
  applyNote: string;
};

export function getJobApplyProps(job: Job, slug?: string): JobApplyProps {
  const jobSlug = slug ?? job.slug;

  if (job.closed_at) {
    return {
      isClosed: true,
      applyHref: null,
      applyLabel: "",
      applyNote: "",
    };
  }

  if (job.application_url) {
    return {
      isClosed: false,
      applyHref: job.application_url,
      applyLabel: "Apply for this job",
      applyNote: "You will be directed to the employer's application process.",
    };
  }

  if (
    job.application_email &&
    job.employer?.application_preference === "email"
  ) {
    return {
      isClosed: false,
      applyHref: `/jobs/${jobSlug}/apply`,
      applyLabel: "Apply for this job",
      applyNote:
        "Submit your application on our site. We'll send it to the employer.",
    };
  }

  if (job.application_email) {
    return {
      isClosed: false,
      applyHref: `mailto:${job.application_email}?subject=Application: ${encodeURIComponent(job.title)}`,
      applyLabel: "Apply by email",
      applyNote: "You will be directed to the employer's application process.",
    };
  }

  if (job.employer?.company_website) {
    return {
      isClosed: false,
      applyHref: job.employer.company_website,
      applyLabel: "Apply via company website",
      applyNote: "Apply via the company website above.",
    };
  }

  return {
    isClosed: false,
    applyHref: `mailto:jobs@example.com?subject=Application: ${encodeURIComponent(job.title)}`,
    applyLabel: "Apply for this job",
    applyNote: "Apply via the company website or contact when available.",
  };
}

