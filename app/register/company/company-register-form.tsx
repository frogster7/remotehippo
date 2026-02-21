"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ApplicationPreference } from "@/lib/types";
import { APPLICATION_PREFERENCES } from "@/lib/types";
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
import { Textarea } from "@/components/ui/textarea";

export function CompanyRegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [companyAbout, setCompanyAbout] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [applicationPreference, setApplicationPreference] =
    useState<ApplicationPreference>("email");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: companyName.trim(),
          company_name: companyName.trim(),
          company_website: companyWebsite.trim() || null,
          company_logo_url: companyLogoUrl.trim() || null,
          company_about: companyAbout.trim() || null,
          company_location: companyLocation.trim() || null,
          application_preference: applicationPreference,
          role: "employer",
        },
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSuccess(true);
    router.refresh();
    router.push("/login");
  }

  if (success) {
    return (
      <Card className="rounded-3xl border border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a confirmation link to {email}. Click it to activate your
            company account, then log in.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border border-border/80 bg-card/95 shadow-sm">
      <CardHeader>
        <CardTitle>Create your company account</CardTitle>
        <CardDescription>
          Enter your company details. You can post jobs after confirming your
          email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Acme Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              autoComplete="organization"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyLogoUrl">Company logo URL (optional)</Label>
            <Input
              id="companyLogoUrl"
              type="url"
              placeholder="https://example.com/logo.png"
              value={companyLogoUrl}
              onChange={(e) => setCompanyLogoUrl(e.target.value)}
              autoComplete="off"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              You can upload a logo from your profile later.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyAbout">About your company</Label>
            <Textarea
              id="companyAbout"
              placeholder="What does your company do? What makes you a great place to work?"
              value={companyAbout}
              onChange={(e) => setCompanyAbout(e.target.value)}
              required
              rows={4}
              className="resize-y min-h-[100px]"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyLocation">Company location</Label>
            <Input
              id="companyLocation"
              type="text"
              placeholder="e.g. Berlin, London, Remote"
              value={companyLocation}
              onChange={(e) => setCompanyLocation(e.target.value)}
              required
              autoComplete="address-level2"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyWebsite">Company website (optional)</Label>
            <Input
              id="companyWebsite"
              type="url"
              placeholder="https://yourcompany.com"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              autoComplete="url"
              disabled={loading}
            />
          </div>
          <div className="space-y-3">
            <Label>How do you want to receive applications?</Label>
            <div className="space-y-2">
              {APPLICATION_PREFERENCES.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer gap-3 rounded-lg border p-3 has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5"
                >
                  <input
                    type="radio"
                    name="applicationPreference"
                    value={opt.value}
                    checked={applicationPreference === opt.value}
                    onChange={() =>
                      setApplicationPreference(opt.value as ApplicationPreference)
                    }
                    disabled={loading}
                    className="mt-0.5 border-input"
                  />
                  <div>
                    <span className="font-medium">{opt.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {opt.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="hr@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">At least 6 characters</p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Sign up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
