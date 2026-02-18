"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  WORK_TYPES,
  JOB_TYPES,
  SPECIALIZATIONS,
  TECH_STACK_OPTIONS,
  type Job,
  type JobFormData,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

function parseList(s: string): string[] {
  return s
    .split(/[,;]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

type Props = {
  job?: Job | null;
  createAction?: (form: JobFormData) => Promise<{ error?: string }>;
  updateAction?: (
    jobId: string,
    form: JobFormData,
  ) => Promise<{ error?: string }>;
  deleteAction?: (jobId: string) => Promise<{ error?: string }>;
};

export function JobForm({
  job,
  createAction,
  updateAction,
  deleteAction,
}: Props) {
  const isEdit = !!job?.id;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [title, setTitle] = useState(job?.title ?? "");
  const [description, setDescription] = useState(job?.description ?? "");
  const initialRole = job?.role ?? "";
  const [specializationsArr, setSpecializationsArr] = useState<string[]>(
    initialRole ? parseList(initialRole) : [],
  );
  const [specializationCustomInput, setSpecializationCustomInput] =
    useState("");
  const [workType, setWorkType] = useState<JobFormData["work_type"]>(
    job?.work_type ?? "remote",
  );
  const [jobType, setJobType] = useState<JobFormData["job_type"]>(
    job?.job_type ?? "full-time",
  );
  const [techStackArr, setTechStackArr] = useState<string[]>(
    job?.tech_stack ?? [],
  );
  const [techCustomInput, setTechCustomInput] = useState("");
  const [salaryMin, setSalaryMin] = useState(
    job?.salary_min != null ? String(job.salary_min) : "",
  );
  const [salaryMax, setSalaryMax] = useState(
    job?.salary_max != null ? String(job.salary_max) : "",
  );
  const [location, setLocation] = useState(job?.location ?? "");
  const [applicationEmail, setApplicationEmail] = useState(
    job?.application_email ?? "",
  );
  const [applicationUrl, setApplicationUrl] = useState(
    job?.application_url ?? "",
  );
  const [isActive, setIsActive] = useState(job?.is_active ?? true);
  const [summary, setSummary] = useState(job?.summary ?? "");
  const [responsibilities, setResponsibilities] = useState(
    job?.responsibilities ?? "",
  );
  const [requirements, setRequirements] = useState(job?.requirements ?? "");
  const [whatWeOffer, setWhatWeOffer] = useState(job?.what_we_offer ?? "");
  const [goodToHave, setGoodToHave] = useState(job?.good_to_have ?? "");
  const [benefits, setBenefits] = useState(job?.benefits ?? "");

  function buildForm(): JobFormData {
    return {
      title,
      description,
      role: specializationsArr.length
        ? specializationsArr.join(", ")
        : "Developer",
      work_type: workType,
      job_type: jobType,
      tech_stack: techStackArr,
      salary_min: salaryMin ? parseInt(salaryMin, 10) : null,
      salary_max: salaryMax ? parseInt(salaryMax, 10) : null,
      location: location.trim() || null,
      is_active: isActive,
      application_email: applicationEmail.trim() || null,
      application_url: applicationUrl.trim() || null,
      summary: summary.trim() || null,
      responsibilities: responsibilities.trim() || null,
      requirements: requirements.trim() || null,
      what_we_offer: whatWeOffer.trim() || null,
      good_to_have: goodToHave.trim() || null,
      benefits: benefits.trim() || null,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (specializationsArr.length === 0) {
      setError("Please select or add at least one specialization.");
      return;
    }
    setLoading(true);
    const form = buildForm();
    const result =
      isEdit && updateAction
        ? await updateAction(job!.id, form)
        : createAction
          ? await createAction(form)
          : { error: "No action available" };
    setLoading(false);
    if (result?.error) setError(result.error);
  }

  async function handleDelete() {
    if (!job?.id || !deleteAction) return;
    if (!confirm("Delete this job listing? This cannot be undone.")) return;
    setDeleteLoading(true);
    setError(null);
    try {
      await deleteAction(job.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
    setDeleteLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit job" : "New job listing"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Update the job details. Only active jobs appear on the public board."
            : "Add a new job. It will appear on the board once saved as active."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Job title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Specialization *</Label>
            <div className="flex flex-wrap gap-2">
              {specializationsArr.map((s) => (
                <Badge
                  key={s}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() =>
                      setSpecializationsArr((prev) =>
                        prev.filter((x) => x !== s),
                      )
                    }
                    className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    disabled={loading}
                    aria-label={`Remove ${s}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SPECIALIZATIONS.filter(
                (s) => !specializationsArr.includes(s),
              ).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    setSpecializationsArr((prev) =>
                      prev.includes(s) ? prev : [...prev, s],
                    )
                  }
                  disabled={loading}
                  className="rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
            <Input
              value={specializationCustomInput}
              onChange={(e) => setSpecializationCustomInput(e.target.value)}
              onBlur={() => {
                const parsed = parseList(specializationCustomInput);
                if (parsed.length) {
                  setSpecializationsArr((prev) =>
                    Array.from(new Set([...prev, ...parsed])),
                  );
                  setSpecializationCustomInput("");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const parsed = parseList(specializationCustomInput);
                  if (parsed.length) {
                    setSpecializationsArr((prev) =>
                      Array.from(new Set([...prev, ...parsed])),
                    );
                    setSpecializationCustomInput("");
                  }
                }
              }}
              placeholder="Or type custom values (comma-separated)"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Click to add, or type custom values (comma-separated)
            </p>
          </div>
          <div className="space-y-2">
            <Label>Tech stack</Label>
            <div className="flex flex-wrap gap-2">
              {techStackArr.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() =>
                      setTechStackArr((prev) => prev.filter((x) => x !== t))
                    }
                    className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    disabled={loading}
                    aria-label={`Remove ${t}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {TECH_STACK_OPTIONS.filter((t) => !techStackArr.includes(t)).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setTechStackArr((prev) =>
                        prev.includes(t) ? prev : [...prev, t],
                      )
                    }
                    disabled={loading}
                    className="rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    {t}
                  </button>
                ),
              )}
            </div>
            <Input
              value={techCustomInput}
              onChange={(e) => setTechCustomInput(e.target.value)}
              onBlur={() => {
                const parsed = parseList(techCustomInput);
                if (parsed.length) {
                  setTechStackArr((prev) =>
                    Array.from(new Set([...prev, ...parsed])),
                  );
                  setTechCustomInput("");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const parsed = parseList(techCustomInput);
                  if (parsed.length) {
                    setTechStackArr((prev) =>
                      Array.from(new Set([...prev, ...parsed])),
                    );
                    setTechCustomInput("");
                  }
                }
              }}
              placeholder="Or type custom values (comma-separated)"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Click to add, or type custom values (comma-separated)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <textarea
              id="description"
              className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details, how to apply, etc."
              disabled={loading}
            />
          </div>
          <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium text-muted-foreground">
              Structured sections (shown as cards on the job page). One point
              per line for lists.
            </p>
            <div className="space-y-2">
              <Label htmlFor="summary">Summary *</Label>
              <textarea
                id="summary"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Short offer summary (e.g. one paragraph or bullet points)"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsibilities</Label>
              <textarea
                id="responsibilities"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                placeholder="One responsibility per line"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <textarea
                id="requirements"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="One requirement per line"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="what_we_offer">What we offer</Label>
              <textarea
                id="what_we_offer"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={whatWeOffer}
                onChange={(e) => setWhatWeOffer(e.target.value)}
                placeholder="One item per line"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="good_to_have">Good to have (optional)</Label>
              <textarea
                id="good_to_have"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={goodToHave}
                onChange={(e) => setGoodToHave(e.target.value)}
                placeholder="Nice-to-have skills or experience, one per line"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits (optional)</Label>
              <textarea
                id="benefits"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                placeholder="e.g. Health insurance, remote work, one per line"
                disabled={loading}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Work mode</Label>
              <Select
                value={workType}
                onValueChange={(v) =>
                  setWorkType(v as JobFormData["work_type"])
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORK_TYPES.map((w) => (
                    <SelectItem key={w.value} value={w.value}>
                      {w.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Work time</Label>
              <Select
                value={jobType}
                onValueChange={(v) => setJobType(v as JobFormData["job_type"])}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((j) => (
                    <SelectItem key={j.value} value={j.value}>
                      {j.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_min">Salary min (e.g. 60000)</Label>
              <Input
                id="salary_min"
                type="number"
                min={0}
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="Optional"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_max">Salary max (e.g. 90000)</Label>
              <Input
                id="salary_max"
                type="number"
                min={0}
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="Optional"
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Europe, or City (for hybrid)"
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="application_email">Application email</Label>
              <Input
                id="application_email"
                type="email"
                value={applicationEmail}
                onChange={(e) => setApplicationEmail(e.target.value)}
                placeholder="e.g. jobs@company.com"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Optional. Applicants will get a mailto link.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="application_url">Application URL</Label>
              <Input
                id="application_url"
                type="url"
                value={applicationUrl}
                onChange={(e) => setApplicationUrl(e.target.value)}
                placeholder="e.g. https://company.com/careers/apply"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Optional. Link to your careers page or ATS.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={isActive}
                onCheckedChange={(c) => setIsActive(!!c)}
                disabled={loading}
              />
              <Label htmlFor="is_active" className="font-normal cursor-pointer">
                Active (visible on job board)
              </Label>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : isEdit ? "Save changes" : "Create job"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/employer/dashboard">Cancel</Link>
            </Button>
            {isEdit && deleteAction && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting…" : "Delete job"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
