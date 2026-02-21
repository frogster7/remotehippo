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
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          href="/employer/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <header className="mb-10 mt-8 rounded-3xl border border-border/80 bg-card/95 p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
            New job listing
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
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
