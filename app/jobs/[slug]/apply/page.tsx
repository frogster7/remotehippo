import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getJobBySlug } from "@/lib/jobs";
import { createSignedCvUrl } from "@/lib/storage";
import { getCvFileName } from "@/lib/utils";
import { ApplicationForm } from "./application-form";
import { ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export const metadata: Metadata = {
  title: "Apply | Niche Tech Job Board",
  description: "Submit your application for this job.",
};

export default async function ApplyPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/jobs/${encodeURIComponent(slug)}/apply`);
  }

  const job = await getJobBySlug(slug);
  if (!job) notFound();
  if (job.closed_at) {
    redirect(`/jobs/${slug}`);
  }
  if (
    !job.application_email ||
    job.employer?.application_preference !== "email"
  ) {
    redirect(`/jobs/${slug}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, last_name, phone_number")
    .eq("id", user.id)
    .single();

  const { data: cvsRows } = await supabase
    .from("user_cvs")
    .select("id, storage_path, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const savedCvs =
    (await Promise.all(
      (cvsRows ?? []).map(async (row) => {
        const { url } = await createSignedCvUrl(supabase, row.storage_path, 3600);
        return {
          id: row.id,
          storage_path: row.storage_path,
          fileName: getCvFileName(row.storage_path),
          downloadUrl: url ?? null,
        };
      })
    )) ?? [];

  const firstCv = savedCvs[0] ?? null;
  const cvDownloadUrl = firstCv?.downloadUrl ?? null;
  const cvFileName = firstCv?.fileName ?? "";
  const hasCv = savedCvs.length > 0;

  const prefilledName = profile?.full_name?.trim() ?? "";
  const prefilledLastName = profile?.last_name?.trim() ?? "";
  const prefilledEmail = user.email ?? "";
  const prefilledPhone = profile?.phone_number?.trim() ?? "";

  const companyName =
    job.employer?.company_name ?? job.employer?.full_name ?? "Company";

  return (
    <main className="min-h-screen bg-gradient-to-b from-muted/50 to-muted/30">
      <div className="mx-auto w-full max-w-[600px] px-4 py-6 sm:px-6">
        <Link
          href={`/jobs/${slug}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to job
        </Link>
        <div className="mb-4">
          <h1 className="text-xl font-semibold">
            Apply for {job.title}
          </h1>
          <p className="text-sm text-muted-foreground">{companyName}</p>
        </div>
        <ApplicationForm
          job={job}
          slug={slug}
          prefilledName={prefilledName}
          prefilledLastName={prefilledLastName}
          prefilledEmail={prefilledEmail}
          prefilledPhone={prefilledPhone}
          hasCv={hasCv}
          cvDownloadUrl={cvDownloadUrl}
          cvFileName={cvFileName}
          savedCvs={savedCvs}
        />
      </div>
    </main>
  );
}
