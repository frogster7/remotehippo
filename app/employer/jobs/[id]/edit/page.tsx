import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getJobByIdForEdit } from "@/lib/jobs";
import { JobForm } from "../../../job-form";
import { updateJob, deleteJob } from "../../../actions";
import { ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobByIdForEdit(id);
  if (!job) return { title: "Job not found" };
  return {
    title: `Edit: ${job.title} | Niche Tech Job Board`,
    description: "Edit your job listing.",
  };
}

export default async function EditJobPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/employer/jobs/" + id + "/edit");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "employer") redirect("/profile");

  const job = await getJobByIdForEdit(id);
  if (!job) notFound();
  if (job.employer_id !== user.id) notFound();

  return (
    <main className="min-h-screen bg-form-page">
      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
        <Link
          href="/employer/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <header className="mt-8 mb-10">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Edit job
          </h1>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-xl">
            Update the listing below. Only active jobs appear on the board.
          </p>
        </header>

        <div className="mt-2">
          <JobForm
            job={job}
            updateAction={updateJob}
            deleteAction={deleteJob}
          />
        </div>
      </div>
    </main>
  );
}
