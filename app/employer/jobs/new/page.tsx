import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JobForm } from "../../job-form";
import { createJob } from "../../actions";

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
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href="/employer/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-semibold mt-2">New job listing</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Fill in the details. You can save as draft (inactive) and publish
          later.
        </p>
        <div className="mt-6">
          <JobForm createAction={createJob} />
        </div>
      </div>
    </main>
  );
}
