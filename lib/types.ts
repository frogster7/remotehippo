// Align with DB enums and job shape

export type WorkType = "remote" | "hybrid";
export type JobType = "full-time" | "contract";

/** Profile role (DB: profile_role enum). */
export type ProfileRole = "employer" | "job_seeker";

/** How employer wants to receive applications (DB: application_preference enum). */
export type ApplicationPreference = "website" | "email";

/** Full profile row from DB. Used for both job seekers and employers. */
export interface Profile {
  id: string;
  role: ProfileRole;
  full_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  company_name: string | null;
  company_website: string | null;
  company_logo_url: string | null;
  company_about: string | null;
  company_location: string | null;
  application_preference: ApplicationPreference | null;
}

/** Single CV row from user_cvs table. */
export interface UserCv {
  id: string;
  user_id: string;
  storage_path: string;
  display_name: string | null;
  created_at: string;
}

/** Job seeker profile fields (subset of Profile). */
export type UserProfile = Pick<
  Profile,
  "id" | "role" | "full_name" | "last_name" | "phone_number"
>;

/** Employer/company profile fields (subset of Profile). */
export type CompanyProfile = Pick<
  Profile,
  | "id"
  | "role"
  | "full_name"
  | "company_name"
  | "company_website"
  | "company_logo_url"
  | "company_about"
  | "company_location"
  | "application_preference"
>;

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
  is_active: boolean;
  application_email: string | null;
  application_url: string | null;
  closed_at: string | null;
  summary: string | null;
  responsibilities: string | null;
  requirements: string | null;
  what_we_offer: string | null;
  good_to_have: string | null;
  benefits: string | null;
  created_at: string;
  updated_at: string;
  employer?: {
    id: string;
    full_name: string | null;
    company_name: string | null;
    company_website: string | null;
    company_logo_url: string | null;
    company_about?: string | null;
    company_location?: string | null;
    application_preference?: ApplicationPreference | null;
  };
}

/** Single row from applications table. */
export interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_last_name: string;
  applicant_email: string;
  applicant_phone: string;
  cv_url: string;
  cover_letter_text: string | null;
  cover_letter_url: string | null;
  status: string;
  applied_at: string;
}

/** Application with nested job (and employer) for list views (e.g. My Applications). */
export interface ApplicationWithJob {
  id: string;
  status: string;
  applied_at: string;
  job: Job;
}

/** Payload for submitting a job application (apply form). */
export interface ApplicationFormData {
  applicant_name: string;
  applicant_last_name: string;
  applicant_email: string;
  applicant_phone: string;
  cv_url: string;
  cover_letter_text?: string | null;
  cover_letter_url?: string | null;
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
  is_active: boolean;
  application_email: string | null;
  application_url: string | null;
  summary: string | null;
  responsibilities: string | null;
  requirements: string | null;
  what_we_offer: string | null;
  good_to_have: string | null;
  benefits: string | null;
}

export interface JobFilters {
  /** Specializations/roles; job role must match any (ilike) */
  roles?: string[];
  /** Work types; job must match any (e.g. remote, hybrid) */
  work_types?: WorkType[];
  job_type?: JobType;
  /** Job types (multi-select); job must match any */
  job_types?: JobType[];
  /** Technologies; job tech_stack must overlap with any */
  tech?: string[];
  salary_min?: number;
  salary_max?: number;
  q?: string;
  location?: string;
}

/** Saved search preset (filters + user-defined name). */
export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: JobFilters;
  created_at: string;
}

export const WORK_TYPES: { value: WorkType; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

export const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: "full-time", label: "Full-time" },
  { value: "contract", label: "Contract" },
];

export const APPLICATION_PREFERENCES: {
  value: ApplicationPreference;
  label: string;
  description: string;
}[] = [
  {
    value: "email",
    label: "Email",
    description: "Applications will be sent to your registered email",
  },
  {
    value: "website",
    label: "Company website",
    description: "Applicants will be redirected to your website to apply",
  },
];

/** Preset specializations for job form and filters. */
export const SPECIALIZATIONS: string[] = [
  "Backend",
  "Frontend",
  "Full-stack",
  "Mobile",
  "Architecture",
  "DevOps",
  "Game dev",
  "Data analyst & BI",
  "Big Data / Data Science",
  "Embedded",
  "QA/Testing",
  "Security",
  "Helpdesk",
  "Product Management",
  "Project Management",
  "Agile",
  "UI/UX",
  "Business analyst",
  "System analyst",
  "SAP&ERP",
  "IT admin",
  "AI/ML",
];

/** Preset tech stack options for job form and filters. */
export const TECH_STACK_OPTIONS: string[] = [
  "JavaScript",
  "HTML",
  "SQL",
  "Python",
  "Java",
  "C#",
  "PHP",
  "C++",
  "TypeScript",
  "Go",
  "C",
  "Rust",
  "Node.js",
  ".NET",
  "React.js",
  "Angular",
  "Android",
  "AWS",
  "iOS",
  "Ruby",
];
