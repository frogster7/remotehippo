"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitApplication } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import type { Job } from "@/lib/types";

type ApplicationFormProps = {
  job: Job;
  slug: string;
  prefilledName: string;
  prefilledLastName: string;
  prefilledEmail: string;
  prefilledPhone: string;
  hasCv: boolean;
  cvDownloadUrl: string | null;
  cvFileName: string;
};

function getCvFileName(path: string): string {
  const parts = path.split("/");
  const full = parts[parts.length - 1] ?? "";
  const withoutTimestamp = full.replace(/^\d+-/, "");
  return decodeURIComponent(withoutTimestamp) || "CV";
}

export function ApplicationForm({
  job,
  slug,
  prefilledName,
  prefilledLastName,
  prefilledEmail,
  prefilledPhone,
  hasCv,
  cvDownloadUrl,
  cvFileName,
}: ApplicationFormProps) {
  const router = useRouter();
  const [name, setName] = useState(prefilledName);
  const [lastName, setLastName] = useState(prefilledLastName);
  const [email, setEmail] = useState(prefilledEmail);
  const [phone, setPhone] = useState(prefilledPhone);
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await submitApplication(slug, {
      applicant_name: name.trim(),
      applicant_last_name: lastName.trim(),
      applicant_email: email.trim(),
      applicant_phone: phone.trim(),
      cover_letter_text: coverLetter.trim() || null,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  const companyName =
    job.employer?.company_name ?? job.employer?.full_name ?? "Company";

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application sent</CardTitle>
          <CardDescription>
            Your application for {job.title} at {companyName} has been
            submitted. The employer will be notified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={`/jobs/${slug}`}>Back to job</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for {job.title}</CardTitle>
        <CardDescription>
          {companyName} will receive your details and CV. You can add a cover
          letter below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasCv && (
          <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-md mb-4">
            Add a CV in your{" "}
            <Link href="/profile" className="underline font-medium">
              profile
            </Link>{" "}
            before applying.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applicant_name">First name</Label>
              <Input
                id="applicant_name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="applicant_last_name">Last name</Label>
              <Input
                id="applicant_last_name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loading}
                autoComplete="family-name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="applicant_email">Email</Label>
            <Input
              id="applicant_email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="applicant_phone">Phone</Label>
            <Input
              id="applicant_phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              autoComplete="tel"
            />
          </div>
          {hasCv && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <span className="font-medium">CV: </span>
              {cvDownloadUrl ? (
                <a
                  href={cvDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {cvFileName}
                </a>
              ) : (
                <span>{cvFileName}</span>
              )}
              <span className="text-muted-foreground ml-1">
                (from your{" "}
                <Link href="/profile" className="underline">
                  profile
                </Link>
                )
              </span>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="cover_letter">Cover letter (optional)</Label>
            <Textarea
              id="cover_letter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Introduce yourself and why you're interested..."
              rows={5}
              disabled={loading}
              className="resize-none"
            />
          </div>
          <Button type="submit" disabled={loading || !hasCv}>
            {loading ? "Sending…" : "Submit application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export { getCvFileName };
