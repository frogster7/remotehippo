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
import { WORK_TYPES, JOB_TYPES, type Job, type JobFormData } from "@/lib/types";

function parseTechStack(s: string): string[] {
  return s
    .split(/[,;]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function techStackToString(arr: string[]): string {
  return (arr ?? []).join(", ");
}

type Props = {
  job?: Job | null;
  createAction?: (form: JobFormData) => Promise<{ error?: string }>;
  updateAction?: (jobId: string, form: JobFormData) => Promise<{ error?: string }>;
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
  const [role, setRole] = useState(job?.role ?? "");
  const [workType, setWorkType] = useState<JobFormData["work_type"]>(
    job?.work_type ?? "remote"
  );
  const [jobType, setJobType] = useState<JobFormData["job_type"]>(
    job?.job_type ?? "full-time"
  );
  const [techStackStr, setTechStackStr] = useState(
    techStackToString(job?.tech_stack ?? [])
  );
  const [salaryMin, setSalaryMin] = useState(
    job?.salary_min != null ? String(job.salary_min) : ""
  );
  const [salaryMax, setSalaryMax] = useState(
    job?.salary_max != null ? String(job.salary_max) : ""
  );
  const [location, setLocation] = useState(job?.location ?? "");
  const [euFriendly, setEuFriendly] = useState(
    job?.eu_timezone_friendly ?? true
  );
  const [isActive, setIsActive] = useState(job?.is_active ?? true);

  function buildForm(): JobFormData {
    return {
      title,
      description,
      role,
      work_type: workType,
      job_type: jobType,
      tech_stack: parseTechStack(techStackStr),
      salary_min: salaryMin ? parseInt(salaryMin, 10) : null,
      salary_max: salaryMax ? parseInt(salaryMax, 10) : null,
      location: location.trim() || null,
      eu_timezone_friendly: euFriendly,
      is_active: isActive,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = buildForm();
    const result = isEdit && updateAction
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
            <Label htmlFor="role">Role / position *</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Developer"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role, requirements, and how to apply..."
              required
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Work type</Label>
              <Select
                value={workType}
                onValueChange={(v) => setWorkType(v as JobFormData["work_type"])}
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
              <Label>Job type</Label>
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
          <div className="space-y-2">
            <Label htmlFor="tech">Tech stack</Label>
            <Input
              id="tech"
              value={techStackStr}
              onChange={(e) => setTechStackStr(e.target.value)}
              placeholder="e.g. React, TypeScript, Node.js"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Comma- or semicolon-separated
            </p>
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
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="eu_friendly"
                checked={euFriendly}
                onCheckedChange={(c) => setEuFriendly(!!c)}
                disabled={loading}
              />
              <Label htmlFor="eu_friendly" className="font-normal cursor-pointer">
                EU timezone friendly
              </Label>
            </div>
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
