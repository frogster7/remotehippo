import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getJobByIdForEdit } from "@/lib/jobs";
import { JobForm } from "../../../job-form";
import { updateJob, deleteJob } from "../../../actions";

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
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href="/employer/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-semibold mt-2">Edit job</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Update the listing. Only active jobs appear on the board.
        </p>
        <div className="mt-6">
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
