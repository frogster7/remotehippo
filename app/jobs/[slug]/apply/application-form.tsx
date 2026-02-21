"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { submitApplication } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Check } from "lucide-react";
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

const fieldInputClass =
  "h-11 rounded-lg border border-primary/30 bg-background px-3.5 text-base shadow-sm transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const textareaBaseClass =
  "flex w-full rounded-lg border border-primary/30 bg-background px-3.5 py-3 text-base shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden transition-shadow";

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
    savedCvs[0]?.storage_path ?? null,
  );
  const [attachFile, setAttachFile] = useState<File | null>(null);
  const [selectedCoverLetterPath, setSelectedCoverLetterPath] = useState<
    string | null
  >(savedCoverLetters[0]?.storage_path ?? null);
  const [attachCoverLetterFile, setAttachCoverLetterFile] =
    useState<File | null>(null);
  const [invalidField, setInvalidField] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [screeningAnswers, setScreeningAnswers] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(screeningQuestions.map((question) => [question.id, ""])),
  );

  const hasCvSource = hasCv || attachFile !== null;

  useEffect(() => {
    if (invalidField && fieldRefs.current[invalidField]) {
      fieldRefs.current[invalidField]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [invalidField]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInvalidField(null);
    setServerError(null);

    if (!name.trim()) {
      setInvalidField("applicant_name");
      return;
    }
    if (!lastName.trim()) {
      setInvalidField("applicant_last_name");
      return;
    }
    if (!email.trim()) {
      setInvalidField("applicant_email");
      return;
    }
    if (!hasCvSource) {
      setInvalidField("cv");
      return;
    }
    for (const question of screeningQuestions) {
      const answer = (screeningAnswers[question.id] ?? "").trim();
      if (!answer) {
        setInvalidField(`screening_${question.id}`);
        return;
      }
      if (question.type === "yes_no" && answer !== "yes" && answer !== "no") {
        setInvalidField(`screening_${question.id}`);
        return;
      }
      if (question.type === "multiple_choice") {
        const validOptions = (question.options ?? []).map((option) =>
          option.trim(),
        );
        if (!validOptions.includes(answer)) {
          setInvalidField(`screening_${question.id}`);
          return;
        }
      }
    }

    setLoading(true);
    const serializedScreeningAnswers = screeningQuestions.map((question) => {
      const rawAnswer = screeningAnswers[question.id] ?? "";
      const answer = rawAnswer.trim();
      return { question_id: question.id, answer };
    });
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
      setServerError(result.error);
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
      setServerError(
        `Cover letter: allowed formats ${CV_ALLOWED_EXTENSIONS.join(", ")}`,
      );
      return;
    }
    setServerError(null);
    setAttachCoverLetterFile(file);
    setSelectedCoverLetterPath(null);
  }

  function handleCvFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!isAllowedCvFileName(file.name)) {
      setServerError(`Allowed formats: ${CV_ALLOWED_EXTENSIONS.join(", ")}`);
      return;
    }
    setServerError(null);
    if (invalidField === "cv") setInvalidField(null);
    setAttachFile(file);
  }

  const companyName =
    job.employer?.company_name ?? job.employer?.full_name ?? "Company";

  const updateScreeningAnswer = (questionId: string, value: string) => {
    setScreeningAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (invalidField === `screening_${questionId}`) setInvalidField(null);
  };

  const renderScreeningQuestionInput = (question: ScreeningQuestion) => {
    const value = screeningAnswers[question.id] ?? "";
    if (question.type === "yes_no") {
      return (
        <div
          className="mt-2 inline-flex w-fit rounded-lg border border-border/80 bg-muted/20 p-0.5 shadow-inner"
          role="radiogroup"
          aria-label={question.prompt}
        >
          {[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ].map((option) => {
            const isSelected = value === option.value;
            return (
              <label
                key={`${question.id}_${option.value}`}
                className={`min-w-[56px] rounded-md px-3 py-1.5 text-center text-xs font-medium cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                } ${loading ? "pointer-events-none opacity-70" : ""}`}
              >
                <input
                  type="radio"
                  name={`screening_${question.id}`}
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) =>
                    updateScreeningAnswer(question.id, e.target.value)
                  }
                  disabled={loading}
                  className="sr-only"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      );
    }

    if (question.type === "multiple_choice") {
      return (
        <div className="space-y-2">
          {(question.options ?? []).map((option) => {
            const normalizedOption = option.trim();
            const isSelected = value === normalizedOption;
            return (
              <label
                key={`${question.id}_${normalizedOption}`}
                className={`relative flex items-center gap-3 rounded-xl border px-4 py-3 text-sm cursor-pointer transition-all duration-200 ease-out ${
                  isSelected
                    ? "border-primary/60 bg-primary/5 shadow-sm ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                    : "border-border/80 bg-muted/20 hover:bg-muted/40 hover:border-primary/20"
                }`}
              >
                <input
                  type="radio"
                  name={`screening_${question.id}`}
                  value={normalizedOption}
                  checked={isSelected}
                  onChange={(e) =>
                    updateScreeningAnswer(question.id, e.target.value)
                  }
                  disabled={loading}
                  className="sr-only"
                />
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "border-2 border-muted-foreground/40"
                  }`}
                >
                  {isSelected && (
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  )}
                </span>
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
        className={textareaBaseClass}
      />
    );
  };

  if (success) {
    return (
      <Card className="overflow-hidden rounded-xl border border-primary/30 bg-form-card shadow-lg">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold text-heading mb-2">
            Application sent
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Your application for {job.title} at {companyName} has been
            submitted.
            {emailSent
              ? " The employer will be notified by email."
              : emailError
                ? ` The notification email could not be sent: ${emailError}. The employer may still see your application in their dashboard.`
                : " Notification email was not sent (not configured). The employer may still see your application in their dashboard."}
          </p>
          <Button asChild>
            <Link href={`/jobs/${slug}`}>Back to job</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-xl border border-primary/30 bg-form-card shadow-lg">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {serverError && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              {serverError}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              ref={(el) => {
                fieldRefs.current["applicant_name"] = el;
              }}
              className={`space-y-2 rounded-lg p-1 transition-colors ${
                invalidField === "applicant_name"
                  ? "border-2 border-destructive bg-destructive/5 -m-1 p-1"
                  : ""
              }`}
            >
              <Label htmlFor="applicant_name">First name *</Label>
              <Input
                id="applicant_name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (invalidField === "applicant_name") setInvalidField(null);
                }}
                required
                disabled={loading}
                autoComplete="given-name"
                className={`${fieldInputClass} ${invalidField === "applicant_name" ? "border-destructive" : ""}`}
              />
            </div>
            <div
              ref={(el) => {
                fieldRefs.current["applicant_last_name"] = el;
              }}
              className={`space-y-2 rounded-lg p-1 transition-colors ${
                invalidField === "applicant_last_name"
                  ? "border-2 border-destructive bg-destructive/5 -m-1 p-1"
                  : ""
              }`}
            >
              <Label htmlFor="applicant_last_name">Last name *</Label>
              <Input
                id="applicant_last_name"
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (invalidField === "applicant_last_name") setInvalidField(null);
                }}
                required
                disabled={loading}
                autoComplete="family-name"
                className={`${fieldInputClass} ${invalidField === "applicant_last_name" ? "border-destructive" : ""}`}
              />
            </div>
          </div>
          <div
            ref={(el) => {
              fieldRefs.current["applicant_email"] = el;
            }}
            className={`space-y-2 rounded-lg p-1 transition-colors ${
              invalidField === "applicant_email"
                ? "border-2 border-destructive bg-destructive/5 -m-1 p-1"
                : ""
            }`}
          >
            <Label htmlFor="applicant_email">Email *</Label>
            <Input
              id="applicant_email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (invalidField === "applicant_email") setInvalidField(null);
              }}
              required
              disabled={loading}
              autoComplete="email"
              className={fieldInputClass}
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
              className={`${fieldInputClass} ${invalidField === "applicant_email" ? "border-destructive" : ""}`}
            />
          </div>
          <div
            ref={(el) => {
              fieldRefs.current["cv"] = el;
            }}
            className={`space-y-2 rounded-lg p-1 transition-colors ${
              invalidField === "cv"
                ? "border-2 border-destructive bg-destructive/5 -m-1 p-1"
                : ""
            }`}
          >
            <Label>CV for this application *</Label>
            <p className="text-sm text-muted-foreground">
              Use a saved CV from your profile or upload one for this
              application only.
            </p>
            {savedCvs.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Saved CVs</p>
                <div className="flex flex-col gap-2">
                  {savedCvs.map((cv) => {
                    const isSelected =
                      !attachFile && selectedCvPath === cv.storage_path;
                    return (
                      <label
                        key={cv.id}
                        className={`relative flex items-center gap-3 rounded-xl border px-4 py-3 text-sm cursor-pointer transition-all duration-200 ease-out ${
                          isSelected
                            ? "border-primary/60 bg-primary/5 shadow-sm ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                            : "border-border/80 bg-muted/20 hover:bg-muted/40 hover:border-primary/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name="cv_choice"
                          value={cv.storage_path}
                          checked={isSelected}
                          onChange={() => {
                            setSelectedCvPath(cv.storage_path);
                            setAttachFile(null);
                            if (invalidField === "cv") setInvalidField(null);
                          }}
                          disabled={loading}
                          className="sr-only"
                        />
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "border-2 border-muted-foreground/40"
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                          )}
                        </span>
                        <span className="text-sm truncate flex-1">
                          {cv.fileName}
                        </span>
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
                    );
                  })}
                </div>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {savedCvs.length > 0
                  ? "Or upload a different file for this application"
                  : "Upload a file"}
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
                className="h-11 rounded-lg border-border/80 shadow-sm hover:bg-secondary/80"
                onClick={() => cvInputRef.current?.click()}
                disabled={loading}
              >
                {attachFile ? attachFile.name : "Choose file"}
              </Button>
              {attachFile && (
                <span className="text-sm text-muted-foreground block">
                  This file will be used for this application only (not saved to
                  your profile).
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
              Add a cover letter from your documents or upload one for this
              application.
            </p>
            {savedCoverLetters.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">From documents</p>
                <div className="flex flex-col gap-2">
                  {(() => {
                    const noLetterSelected =
                      !selectedCoverLetterPath && !attachCoverLetterFile;
                    return (
                      <label
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm cursor-pointer transition-all duration-200 ease-out ${
                          noLetterSelected
                            ? "border-primary/60 bg-primary/5 shadow-sm ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                            : "border-border/80 bg-muted/20 hover:bg-muted/40 hover:border-primary/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name="cover_letter_choice"
                          value=""
                          checked={noLetterSelected}
                          onChange={() => {
                            setSelectedCoverLetterPath(null);
                            setAttachCoverLetterFile(null);
                          }}
                          disabled={loading}
                          className="sr-only"
                        />
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                            noLetterSelected
                              ? "bg-primary text-primary-foreground"
                              : "border-2 border-muted-foreground/40"
                          }`}
                        >
                          {noLetterSelected && (
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                          )}
                        </span>
                        <span className="text-sm">No cover letter</span>
                      </label>
                    );
                  })()}
                  {savedCoverLetters.map((cl) => {
                    const isSelected =
                      !attachCoverLetterFile &&
                      selectedCoverLetterPath === cl.storage_path;
                    return (
                      <label
                        key={cl.id}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm cursor-pointer transition-all duration-200 ease-out ${
                          isSelected
                            ? "border-primary/60 bg-primary/5 shadow-sm ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                            : "border-border/80 bg-muted/20 hover:bg-muted/40 hover:border-primary/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name="cover_letter_choice"
                          value={cl.storage_path}
                          checked={isSelected}
                          onChange={() => {
                            setSelectedCoverLetterPath(cl.storage_path);
                            setAttachCoverLetterFile(null);
                          }}
                          disabled={loading}
                          className="sr-only"
                        />
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "border-2 border-muted-foreground/40"
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                          )}
                        </span>
                        <span className="text-sm truncate flex-1">
                          {cl.fileName}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {savedCoverLetters.length > 0
                  ? "Or upload for this application only"
                  : "Upload a cover letter"}
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
                className="h-11 rounded-lg border-border/80 shadow-sm hover:bg-secondary/80"
                onClick={() => coverLetterInputRef.current?.click()}
                disabled={loading}
              >
                {attachCoverLetterFile
                  ? attachCoverLetterFile.name
                  : "Choose file"}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover_letter">
              Cover letter message (optional)
            </Label>
            <Textarea
              id="cover_letter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Add a short message or introduction..."
              rows={3}
              disabled={loading}
              className={textareaBaseClass}
            />
          </div>
          {screeningQuestions.length > 0 && (
            <div className="space-y-3 rounded-lg border border-primary/20 bg-muted/20 p-4">
              <p className="text-sm font-semibold text-foreground">
                Pre-application questions
              </p>
              {screeningQuestions.map((question, index) => (
                <div
                  key={question.id}
                  ref={(el) => {
                    fieldRefs.current[`screening_${question.id}`] = el;
                  }}
                  className={`space-y-1 rounded-lg p-2 transition-colors ${
                    invalidField === `screening_${question.id}`
                      ? "rounded-lg border-2 border-destructive bg-destructive/5"
                      : ""
                  }`}
                >
                  <Label
                    htmlFor={`screening_${question.id}`}
                    className="block text-sm font-medium"
                  >
                    {index + 1}. {question.prompt} *
                  </Label>
                  <div className="mt-2">{renderScreeningQuestionInput(question)}</div>
                </div>
              ))}
            </div>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="h-11 rounded-lg px-6 shadow-md hover:shadow-lg transition-shadow"
          >
            {loading ? "Sending…" : "Submit application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
