"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Image from "next/image";
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
import type { Job, ScreeningQuestion } from "@/lib/types";
import { CV_ALLOWED_EXTENSIONS, isAllowedCvFileName } from "@/lib/storage";

export type SavedCvOption = {
  id: string;
  storage_path: string;
  fileName: string;
  downloadUrl: string | null;
};

export type SavedCoverLetterOption = {
  id: string;
  storage_path: string;
  fileName: string;
};

type ApplicationFormProps = {
  job: Job;
  slug: string;
  prefilledName: string;
  prefilledLastName: string;
  prefilledEmail: string;
  prefilledPhone: string;
  hasCv: boolean;
  savedCvs: SavedCvOption[];
  savedCoverLetters: SavedCoverLetterOption[];
};

const CV_ACCEPT = ".pdf,.doc,.docx";

export function ApplicationForm({
  job,
  slug,
  prefilledName,
  prefilledLastName,
  prefilledEmail,
  prefilledPhone,
  hasCv,
  savedCvs,
  savedCoverLetters = [],
}: ApplicationFormProps) {
  const router = useRouter();
  const screeningQuestions = job.screening_questions ?? [];
  const cvInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(prefilledName);
  const [lastName, setLastName] = useState(prefilledLastName);
  const [email, setEmail] = useState(prefilledEmail);
  const [phone, setPhone] = useState(prefilledPhone);
  const [coverLetter, setCoverLetter] = useState("");
  const [selectedCvPath, setSelectedCvPath] = useState<string | null>(
    savedCvs[0]?.storage_path ?? null
  );
  const [attachFile, setAttachFile] = useState<File | null>(null);
  const [selectedCoverLetterPath, setSelectedCoverLetterPath] = useState<string | null>(
    savedCoverLetters[0]?.storage_path ?? null
  );
  const [attachCoverLetterFile, setAttachCoverLetterFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [screeningAnswers, setScreeningAnswers] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(
      screeningQuestions.map((question) => [question.id, ""]),
    ),
  );

  const hasCvSource = hasCv || attachFile !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const serializedScreeningAnswers = screeningQuestions.map((question) => {
      const rawAnswer = screeningAnswers[question.id] ?? "";
      const answer = rawAnswer.trim();
      return { question_id: question.id, answer };
    });
    for (const question of screeningQuestions) {
      const answer = (screeningAnswers[question.id] ?? "").trim();
      if (!answer) {
        setError("Please answer all pre-application questions.");
        setLoading(false);
        return;
      }
      if (question.type === "yes_no" && answer !== "yes" && answer !== "no") {
        setError(`Invalid answer for "${question.prompt}".`);
        setLoading(false);
        return;
      }
      if (question.type === "multiple_choice") {
        const validOptions = (question.options ?? []).map((option) =>
          option.trim(),
        );
        if (!validOptions.includes(answer)) {
          setError(`Invalid answer for "${question.prompt}".`);
          setLoading(false);
          return;
        }
      }
    }
    const formData = new FormData();
    formData.set("applicant_name", name.trim());
    formData.set("applicant_last_name", lastName.trim());
    formData.set("applicant_email", email.trim());
    formData.set("applicant_phone", phone.trim());
    formData.set("cover_letter_text", coverLetter.trim());
    if (attachCoverLetterFile) {
      formData.set("cover_letter_file", attachCoverLetterFile);
    } else if (selectedCoverLetterPath) {
      formData.set("cover_letter_path", selectedCoverLetterPath);
    }
    if (attachFile) {
      formData.set("cv_file", attachFile);
    } else if (selectedCvPath) {
      formData.set("cv_path", selectedCvPath);
    }
    formData.set(
      "screening_answers",
      JSON.stringify(serializedScreeningAnswers),
    );
    const result = await submitApplication(slug, formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEmailSent(result.emailSent ?? false);
    setEmailError(result.emailError ?? null);
    setSuccess(true);
    router.refresh();
  }

  function handleCoverLetterFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!isAllowedCvFileName(file.name)) {
      setError(`Cover letter: allowed formats ${CV_ALLOWED_EXTENSIONS.join(", ")}`);
      return;
    }
    setError(null);
    setAttachCoverLetterFile(file);
    setSelectedCoverLetterPath(null);
  }

  function handleCvFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!isAllowedCvFileName(file.name)) {
      setError(`Allowed formats: ${CV_ALLOWED_EXTENSIONS.join(", ")}`);
      return;
    }
    setError(null);
    setAttachFile(file);
  }

  const companyName =
    job.employer?.company_name ?? job.employer?.full_name ?? "Company";

  const updateScreeningAnswer = (questionId: string, value: string) => {
    setScreeningAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const renderScreeningQuestionInput = (question: ScreeningQuestion) => {
    const value = screeningAnswers[question.id] ?? "";
    if (question.type === "yes_no") {
      return (
        <div className="flex flex-wrap gap-3">
          {[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ].map((option) => (
            <label
              key={`${question.id}_${option.value}`}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
            >
              <input
                type="radio"
                name={`screening_${question.id}`}
                value={option.value}
                checked={value === option.value}
                onChange={(e) =>
                  updateScreeningAnswer(question.id, e.target.value)
                }
                disabled={loading}
              />
              {option.label}
            </label>
          ))}
        </div>
      );
    }

    if (question.type === "multiple_choice") {
      return (
        <div className="space-y-2">
          {(question.options ?? []).map((option) => {
            const normalizedOption = option.trim();
            return (
              <label
                key={`${question.id}_${normalizedOption}`}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
              >
                <input
                  type="radio"
                  name={`screening_${question.id}`}
                  value={normalizedOption}
                  checked={value === normalizedOption}
                  onChange={(e) =>
                    updateScreeningAnswer(question.id, e.target.value)
                  }
                  disabled={loading}
                />
                {option}
              </label>
            );
          })}
        </div>
      );
    }

    return (
      <Textarea
        value={value}
        onChange={(e) => updateScreeningAnswer(question.id, e.target.value)}
        placeholder="Type your answer"
        rows={3}
        disabled={loading}
      />
    );
  };

  if (success) {
    return (
      <Card className="rounded-3xl border border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle>Application sent</CardTitle>
          <CardDescription>
            Your application for {job.title} at {companyName} has been submitted.
            {emailSent
              ? " The employer will be notified by email."
              : emailError
                ? ` The notification email could not be sent: ${emailError}. The employer may still see your application in their dashboard.`
                : " Notification email was not sent (not configured). The employer may still see your application in their dashboard."}
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
    <Card className="rounded-3xl border border-border/80 bg-card/95 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          {job.employer?.company_logo_url ? (
            <Image
              src={job.employer.company_logo_url}
              alt=""
              width={48}
              height={48}
              className="rounded-lg object-cover shrink-0"
              unoptimized
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
              {companyName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <CardTitle>Apply for {job.title}</CardTitle>
            <CardDescription>
              {companyName} will receive your details and CV. You can add a
              cover letter below.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
          <div className="space-y-2">
            <Label>CV for this application</Label>
            <p className="text-sm text-muted-foreground">
              Use a saved CV from your profile or upload one for this application only.
            </p>
            {savedCvs.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Saved CVs</p>
                <div className="flex flex-col gap-2">
                  {savedCvs.map((cv) => (
                    <label
                      key={cv.id}
                      className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 has-[:checked]:bg-muted/50"
                    >
                      <input
                        type="radio"
                        name="cv_choice"
                        value={cv.storage_path}
                        checked={!attachFile && selectedCvPath === cv.storage_path}
                        onChange={() => {
                          setSelectedCvPath(cv.storage_path);
                          setAttachFile(null);
                        }}
                        disabled={loading}
                        className="rounded-full border-input"
                      />
                      <span className="text-sm truncate flex-1">{cv.fileName}</span>
                      {cv.downloadUrl && (
                        <a
                          href={cv.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Preview
                        </a>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {savedCvs.length > 0 ? "Or upload a different file for this application" : "Upload a file"}
              </p>
              <input
                ref={cvInputRef}
                type="file"
                accept={CV_ACCEPT}
                className="hidden"
                onChange={handleCvFileChange}
                disabled={loading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => cvInputRef.current?.click()}
                disabled={loading}
              >
                {attachFile ? attachFile.name : "Choose file"}
              </Button>
              {attachFile && (
                <span className="text-sm text-muted-foreground block">
                  This file will be used for this application only (not saved to your profile).
                </span>
              )}
            </div>
            {!hasCvSource && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Choose a saved CV or upload a file to continue.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Cover letter (optional)</Label>
            <p className="text-sm text-muted-foreground">
              Add a cover letter from your documents or upload one for this application.
            </p>
            {savedCoverLetters.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">From documents</p>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 has-[:checked]:bg-muted/50">
                    <input
                      type="radio"
                      name="cover_letter_choice"
                      value=""
                      checked={!selectedCoverLetterPath && !attachCoverLetterFile}
                      onChange={() => {
                        setSelectedCoverLetterPath(null);
                        setAttachCoverLetterFile(null);
                      }}
                      disabled={loading}
                      className="rounded-full border-input"
                    />
                    <span className="text-sm">No cover letter</span>
                  </label>
                  {savedCoverLetters.map((cl) => (
                    <label
                      key={cl.id}
                      className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 has-[:checked]:bg-muted/50"
                    >
                      <input
                        type="radio"
                        name="cover_letter_choice"
                        value={cl.storage_path}
                        checked={!attachCoverLetterFile && selectedCoverLetterPath === cl.storage_path}
                        onChange={() => {
                          setSelectedCoverLetterPath(cl.storage_path);
                          setAttachCoverLetterFile(null);
                        }}
                        disabled={loading}
                        className="rounded-full border-input"
                      />
                      <span className="text-sm truncate flex-1">{cl.fileName}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {savedCoverLetters.length > 0 ? "Or upload for this application only" : "Upload a cover letter"}
              </p>
              <input
                ref={coverLetterInputRef}
                type="file"
                accept={CV_ACCEPT}
                className="hidden"
                onChange={handleCoverLetterFileChange}
                disabled={loading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => coverLetterInputRef.current?.click()}
                disabled={loading}
              >
                {attachCoverLetterFile ? attachCoverLetterFile.name : "Choose file"}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover_letter">Cover letter message (optional)</Label>
            <Textarea
              id="cover_letter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Add a short message or introduction..."
              rows={3}
              disabled={loading}
              className="resize-none"
            />
          </div>
          {screeningQuestions.length > 0 && (
            <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-4">
              <p className="text-sm font-semibold text-foreground">
                Pre-application questions
              </p>
              {screeningQuestions.map((question, index) => (
                <div key={question.id} className="space-y-2">
                  <Label htmlFor={`screening_${question.id}`}>
                    {index + 1}. {question.prompt}
                  </Label>
                  {renderScreeningQuestionInput(question)}
                </div>
              ))}
            </div>
          )}
          <Button type="submit" disabled={loading || !hasCvSource}>
            {loading ? "Sending…" : "Submit application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
