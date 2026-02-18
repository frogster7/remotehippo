import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JobForm } from "../../job-form";
import { createJob } from "../../actions";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "New job | Niche Tech Job Board",
  description: "Post a new job listing.",
};

export default async function NewJobPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/employer/jobs/new");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "employer") redirect("/profile");

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
            New job listing
          </h1>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-xl">
            Fill in the details below. You can save as draft and publish when
            you’re ready.
          </p>
        </header>

        <div className="mt-2">
          <JobForm createAction={createJob} />
        </div>
      </div>
    </main>
  );
}
