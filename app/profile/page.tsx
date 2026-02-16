import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createSignedCvUrl } from "@/lib/storage";
import type { ApplicationPreference, Profile as ProfileType } from "@/lib/types";
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
    .select(
      "id, role, full_name, last_name, phone_number, cv_file_url, company_name, company_website, company_logo_url, company_about, company_location, application_preference"
    )
    .eq("id", user.id)
    .single();

  let cvDownloadUrl: string | null = null;
  if (profile?.cv_file_url) {
    const { url } = await createSignedCvUrl(supabase, profile.cv_file_url, 3600);
    cvDownloadUrl = url;
  }

  const profileData: ProfileType = {
    id: profile?.id ?? user.id,
    role: profile?.role ?? "job_seeker",
    full_name: profile?.full_name ?? null,
    last_name: profile?.last_name ?? null,
    phone_number: profile?.phone_number ?? null,
    cv_file_url: profile?.cv_file_url ?? null,
    company_name: profile?.company_name ?? null,
    company_website: profile?.company_website ?? null,
    company_logo_url: profile?.company_logo_url ?? null,
    company_about: profile?.company_about ?? null,
    company_location: profile?.company_location ?? null,
    application_preference: (profile?.application_preference ??
      null) as ApplicationPreference | null,
  };

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
          profile={profileData}
          cvDownloadUrl={cvDownloadUrl}
        />
      </div>
    </main>
  );
}
