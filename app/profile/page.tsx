import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "Profile | Niche Tech Job Board",
  description: "Manage your account and profile.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, company_name, company_website")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen p-6 max-w-lg mx-auto">
      <div className="space-y-6">
        <div>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to home
          </Link>
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="text-muted-foreground text-sm">
            Update your account and, if you’re an employer, your company info.
          </p>
        </div>
        <ProfileForm
          profile={{
            id: profile?.id ?? user.id,
            role: profile?.role ?? "job_seeker",
            full_name: profile?.full_name ?? null,
            company_name: profile?.company_name ?? null,
            company_website: profile?.company_website ?? null,
          }}
        />
      </div>
    </main>
  );
}
