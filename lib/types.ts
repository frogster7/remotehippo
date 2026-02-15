// Align with DB enums and job shape

export type WorkType = "remote" | "hybrid";
export type JobType = "full-time" | "contract";

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  slug: string;
  description: string;
  tech_stack: string[];
  role: string;
  work_type: WorkType;
  job_type: JobType;
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  eu_timezone_friendly: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  employer?: {
    id: string;
    full_name: string | null;
    company_name: string | null;
    company_website: string | null;
    company_logo_url: string | null;
  };
}

/** Payload for creating/updating a job (employer form). */
export interface JobFormData {
  title: string;
  description: string;
  role: string;
  work_type: WorkType;
  job_type: JobType;
  tech_stack: string[];
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  eu_timezone_friendly: boolean;
  is_active: boolean;
}

export interface JobFilters {
  role?: string;
  work_type?: WorkType;
  job_type?: JobType;
  tech?: string;
  salary_min?: number;
  salary_max?: number;
  q?: string;
}

export const WORK_TYPES: { value: WorkType; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

export const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: "full-time", label: "Full-time" },
  { value: "contract", label: "Contract" },
];
