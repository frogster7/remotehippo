"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProfileRole = "employer" | "job_seeker";

type Profile = {
  id: string;
  role: ProfileRole;
  full_name: string | null;
  company_name: string | null;
  company_website: string | null;
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [role, setRole] = useState<ProfileRole>(profile.role);
  const [companyName, setCompanyName] = useState(profile.company_name ?? "");
  const [companyWebsite, setCompanyWebsite] = useState(
    profile.company_website ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        role,
        company_name: role === "employer" ? (companyName || null) : null,
        company_website:
          role === "employer" ? (companyWebsite || null) : null,
      })
      .eq("id", profile.id);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Full page load so the layout (header) re-renders without the session
    window.location.href = "/";
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Your name and role. Employers can add company details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                {error}
              </p>
            )}
            {saved && (
              <p className="text-sm text-green-600 dark:text-green-400 bg-green-500/10 p-2 rounded-md">
                Profile saved.
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="job_seeker"
                    checked={role === "job_seeker"}
                    onChange={() => setRole("job_seeker")}
                    disabled={loading}
                    className="rounded-full border-input"
                  />
                  <span className="text-sm">Job seeker</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="employer"
                    checked={role === "employer"}
                    onChange={() => setRole("employer")}
                    disabled={loading}
                    className="rounded-full border-input"
                  />
                  <span className="text-sm">Employer</span>
                </label>
              </div>
            </div>
            {role === "employer" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company name</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Acme Inc"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Company website</Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    placeholder="https://acme.com"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sign out</CardTitle>
          <CardDescription>Log out of your account on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleSignOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
