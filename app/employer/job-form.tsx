"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  WORK_TYPES,
  JOB_TYPES,
  SPECIALIZATIONS,
  TECH_STACK_OPTIONS,
  type Job,
  type JobFormData,
  type ScreeningQuestion,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

function parseList(s: string): string[] {
  return s
    .split(/[,;]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Split newline-separated string into trimmed non-empty lines (matches job page SectionContent). */
function parseLines(s: string | null | undefined): string[] {
  if (!s) return [];
  return s
    .split(/\n/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function createQuestionId() {
  return `q_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

const fieldInputClass =
  "h-11 rounded-lg border-primary/30 bg-background px-3.5 text-base shadow-sm transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const textareaBaseClass =
  "flex w-full rounded-lg border border-primary/30 bg-background px-3.5 py-3 text-base shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden transition-shadow";

function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  disabled,
  required,
  id,
  minRows = 2,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  minRows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = 20;
    const minHeight = minRows * lineHeight;
    el.style.height = `${Math.max(minHeight, el.scrollHeight)}px`;
  }, [value, minRows]);

  return (
    <textarea
      ref={ref}
      id={id}
      className={textareaBaseClass}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      rows={minRows}
    />
  );
}

type ListItemFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string[];
  onChange: (items: string[]) => void;
  disabled?: boolean;
  optional?: boolean;
};

function ListItemField({
  id,
  label,
  placeholder,
  value,
  onChange,
  disabled,
  optional,
}: ListItemFieldProps) {
  const [inputValue, setInputValue] = useState("");

  function addItem() {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInputValue("");
  }

  function removeItem(item: string) {
    onChange(value.filter((x) => x !== item));
  }

  return (
    <div className="space-y-2">
      {label ? (
        <Label htmlFor={id}>
          {label}
          {optional && (
            <span className="text-muted-foreground font-normal">
              {" "}
              (optional)
            </span>
          )}
        </Label>
      ) : null}
      <div className="flex gap-2">
        <Input
          id={id}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={fieldInputClass}
        />
        <Button
          type="button"
          variant="secondary"
          size="default"
          className="h-11 rounded-lg px-5 shadow-sm border border-border/80 hover:bg-secondary/80"
          onClick={addItem}
          disabled={disabled || !inputValue.trim()}
        >
          Add
        </Button>
      </div>
      {value.length > 0 ? (
        <ul className="space-y-2">
          {value.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 rounded-lg border border-border/80 bg-muted/30 px-3.5 py-2.5 text-sm shadow-sm hover:bg-muted/50 transition-colors"
            >
              <span className="flex-1 text-muted-foreground">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="shrink-0 rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground"
                disabled={disabled}
                aria-label={`Remove ${item}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
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
  const [responsibilitiesArr, setResponsibilitiesArr] = useState<string[]>(() =>
    parseLines(job?.responsibilities),
  );
  const [requirementsArr, setRequirementsArr] = useState<string[]>(() =>
    parseLines(job?.requirements),
  );
  const [whatWeOfferArr, setWhatWeOfferArr] = useState<string[]>(() =>
    parseLines(job?.what_we_offer),
  );
  const [goodToHaveArr, setGoodToHaveArr] = useState<string[]>(() =>
    parseLines(job?.good_to_have),
  );
  const [benefitsArr, setBenefitsArr] = useState<string[]>(() =>
    parseLines(job?.benefits),
  );
  const [screeningQuestions, setScreeningQuestions] = useState<
    ScreeningQuestion[]
  >(() =>
    (job?.screening_questions ?? []).map((question, idx) => ({
      id: question.id || `q_${idx + 1}`,
      prompt: question.prompt ?? "",
      type: question.type ?? "text",
      options:
        question.type === "multiple_choice"
          ? (question.options ?? []).filter(Boolean)
          : undefined,
    })),
  );

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
      responsibilities:
        responsibilitiesArr.length > 0 ? responsibilitiesArr.join("\n") : null,
      requirements:
        requirementsArr.length > 0 ? requirementsArr.join("\n") : null,
      what_we_offer:
        whatWeOfferArr.length > 0 ? whatWeOfferArr.join("\n") : null,
      good_to_have: goodToHaveArr.length > 0 ? goodToHaveArr.join("\n") : null,
      benefits: benefitsArr.length > 0 ? benefitsArr.join("\n") : null,
      screening_questions: screeningQuestions
        .map((question) => {
          const prompt = question.prompt.trim();
          const options =
            question.type === "multiple_choice"
              ? (question.options ?? []).map((opt) => opt.trim()).filter(Boolean)
              : undefined;
          return {
            id: question.id || createQuestionId(),
            prompt,
            type: question.type,
            options,
          } as ScreeningQuestion;
        })
        .filter((question) => question.prompt.length > 0),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (specializationsArr.length === 0) {
      setError("Please select or add at least one specialization.");
      return;
    }
    if (responsibilitiesArr.length === 0) {
      setError("Please add at least one responsibility.");
      return;
    }
    if (requirementsArr.length === 0) {
      setError("Please add at least one requirement.");
      return;
    }
    if (whatWeOfferArr.length === 0) {
      setError("Please add at least one item in What we offer.");
      return;
    }
    for (const [index, question] of screeningQuestions.entries()) {
      if (!question.prompt.trim()) {
        setError(`Screening question ${index + 1} cannot be empty.`);
        return;
      }
      if (question.type === "multiple_choice") {
        const options = (question.options ?? [])
          .map((option) => option.trim())
          .filter(Boolean);
        if (options.length < 2) {
          setError(
            `Screening question ${index + 1} needs at least 2 options.`,
          );
          return;
        }
      }
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

  const sectionDivider = (
    <div
      className="h-px w-full shrink-0 bg-gradient-to-r from-transparent via-border to-transparent opacity-80"
      aria-hidden
    />
  );

  return (
    <Card className="rounded-xl border-primary/100 shadow-lg bg-form-card">
      <CardContent className="p-6 sm:p-8 pt-6">
        <form onSubmit={handleSubmit} className="space-y-0">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[18px]">
              Job title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
              required
              disabled={loading}
              className={fieldInputClass}
            />
          </div>
          <div className="py-6" role="separator">
            {sectionDivider}
          </div>
          <div className="space-y-2">
            <Label className="text-[18px]">Specialization *</Label>
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
            <div className="flex flex-wrap gap-2 mt-2">
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
                  className="rounded-full border-2 border-secondary bg-secondary/50 px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary hover:border-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
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
              className={fieldInputClass}
            />
          </div>
          <div className="py-6" role="separator">
            {sectionDivider}
          </div>
          <div className="space-y-2">
            <Label className="text-[18px]">Tech stack</Label>
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
            <div className="flex flex-wrap gap-2 mt-2">
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
                    className="rounded-full border-2 border-secondary bg-secondary/50 px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary hover:border-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
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
              className={fieldInputClass}
            />
          </div>
          <div className="py-6" role="separator">
            {sectionDivider}
          </div>
          <div className="space-y-2">
            <h3 className="text-[18px] font-medium">Summary *</h3>
            <AutoResizeTextarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Short offer summary (e.g. one paragraph or bullet points)"
              required
              disabled={loading}
              minRows={3}
            />
          </div>
          <div className="py-6" role="separator">
            {sectionDivider}
          </div>
          <div className="space-y-2">
            <h3 className="text-[18px] font-medium">Responsibilities *</h3>
            <ListItemField
              id="responsibilities"
              label=""
              placeholder="Type a responsibility and click Add or press Enter"
              value={responsibilitiesArr}
              onChange={setResponsibilitiesArr}
              disabled={loading}
            />
          </div>
          <div className="py-6" role="separator">
            {sectionDivider}
          </div>
          <div className="space-y-2">
            <h3 className="text-[18px] font-medium">Requirements *</h3>
            <ListItemField
              id="requirements"
              label=""
              placeholder="Type a requirement and click Add or press Enter"
              value={requirementsArr}
              onChange={setRequirementsArr}
              disabled={loading}
            />
          </div>
          <div className="py-6" role="separator">
            {sectionDivider}
          </div>
          <div className="space-y-2">
            <h3 className="text-[18px] font-medium">What we offer *</h3>
            <ListItemField
              id="what_we_offer"
              label=""
              placeholder="Type an item and click Add or press Enter"
              value={whatWeOfferArr}
              onChange={setWhatWeOfferArr}
              disabled={loading}
            />
          </div>
          <div className="py-6" role="separator">
            {sectionDivider}
          </div>
          <div className="space-y-2">
            <h3 className="text-[18px] font-medium">Good to have</h3>
            <ListItemField
              id="good_to_have"
              label=""
              placeholder="Nice-to-have skills or experience"
              value={goodToHaveArr}
              onChange={setGoodToHaveArr}
              disabled={loading}
              optional
            />
          </div>
          <div className="py-6" role="separator">
            {sectionDivider}
          </div>
          <div className="space-y-2">
            <h3 className="text-[18px] font-medium">Benefits</h3>
            <ListItemField
              id="benefits"
              label=""
              placeholder="e.g. Health insurance, remote work"
              value={benefitsArr}
              onChange={setBenefitsArr}
              disabled={loading}
              optional
            />
          </div>
          <div className="py-6" role="separator">
            {sectionDivider}
          </div>
          <div className="space-y-3">
            <h3 className="text-[18px] font-medium">Pre-application questions</h3>
            <p className="text-sm text-muted-foreground">
              Applicants must answer all questions before they can submit.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setScreeningQuestions((prev) => [
                    ...prev,
                    { id: createQuestionId(), prompt: "", type: "text" },
                  ])
                }
                disabled={loading}
              >
                Add text question
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setScreeningQuestions((prev) => [
                    ...prev,
                    { id: createQuestionId(), prompt: "", type: "yes_no" },
                  ])
                }
                disabled={loading}
              >
                Add yes/no question
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setScreeningQuestions((prev) => [
                    ...prev,
                    {
                      id: createQuestionId(),
                      prompt: "",
                      type: "multiple_choice",
                      options: ["", ""],
                    },
                  ])
                }
                disabled={loading}
              >
                Add multiple-choice question
              </Button>
            </div>

            {screeningQuestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No custom questions added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {screeningQuestions.map((question, questionIdx) => (
                  <div
                    key={question.id}
                    className="rounded-lg border border-primary/20 bg-muted/20 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        Question {questionIdx + 1}
                        <span className="ml-1.5 font-normal text-muted-foreground">
                          ({question.type === "text" ? "Text" : question.type === "yes_no" ? "Yes/No" : "Multiple choice"})
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setScreeningQuestions((prev) =>
                            prev.filter((q) => q.id !== question.id),
                          )
                        }
                        className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        disabled={loading}
                        aria-label={`Remove question ${questionIdx + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`screening_prompt_${question.id}`}>
                        Prompt *
                      </Label>
                      <Input
                        id={`screening_prompt_${question.id}`}
                        value={question.prompt}
                        onChange={(e) =>
                          setScreeningQuestions((prev) =>
                            prev.map((q) =>
                              q.id === question.id
                                ? { ...q, prompt: e.target.value }
                                : q,
                            ),
                          )
                        }
                        placeholder="Type the question applicant must answer"
                        disabled={loading}
                        className={fieldInputClass}
                      />
                    </div>
                    {question.type === "multiple_choice" && (
                      <div className="space-y-2">
                        <Label>Answer options *</Label>
                        <div className="space-y-2">
                          {(question.options ?? []).map((option, optionIdx) => (
                            <div
                              key={`${question.id}_opt_${optionIdx}`}
                              className="flex items-center gap-2"
                            >
                              <Input
                                value={option}
                                onChange={(e) =>
                                  setScreeningQuestions((prev) =>
                                    prev.map((q) => {
                                      if (q.id !== question.id) return q;
                                      const nextOptions = [...(q.options ?? [])];
                                      nextOptions[optionIdx] = e.target.value;
                                      return { ...q, options: nextOptions };
                                    }),
                                  )
                                }
                                placeholder={`Option ${optionIdx + 1}`}
                                disabled={loading}
                                className={fieldInputClass}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setScreeningQuestions((prev) =>
                                    prev.map((q) => {
                                      if (q.id !== question.id) return q;
                                      const nextOptions = [...(q.options ?? [])];
                                      nextOptions.splice(optionIdx, 1);
                                      return {
                                        ...q,
                                        options:
                                          nextOptions.length > 0
                                            ? nextOptions
                                            : [""],
                                      };
                                    }),
                                  )
                                }
                                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                disabled={loading || (question.options?.length ?? 0) <= 2}
                                aria-label={`Remove option ${optionIdx + 1}`}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setScreeningQuestions((prev) =>
                              prev.map((q) =>
                                q.id === question.id
                                  ? { ...q, options: [...(q.options ?? []), ""] }
                                  : q,
                              ),
                            )
                          }
                          disabled={loading}
                        >
                          Add option
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="py-6" role="separator">
            {sectionDivider}
          </div>
          <div className="space-y-2">
            <h3 className="text-[18px] font-medium">Description</h3>
            <AutoResizeTextarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details, how to apply, etc."
              disabled={loading}
              minRows={4}
            />
          </div>
          <div className="py-6" role="separator">
            {sectionDivider}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[18px]">Work time</Label>
              <div className="flex rounded-lg border border-primary/30 overflow-hidden shadow-sm">
                {JOB_TYPES.map((j) => (
                  <button
                    key={j.value}
                    type="button"
                    onClick={() =>
                      setJobType(j.value as JobFormData["job_type"])
                    }
                    disabled={loading}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all ${
                      jobType === j.value
                        ? "bg-primary text-primary-foreground shadow-inner"
                        : "bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {j.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[18px]">Work mode</Label>
              <div className="flex rounded-lg border border-primary/30 overflow-hidden shadow-sm">
                {WORK_TYPES.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() =>
                      setWorkType(w.value as JobFormData["work_type"])
                    }
                    disabled={loading}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all ${
                      workType === w.value
                        ? "bg-primary text-primary-foreground shadow-inner"
                        : "bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="py-6" role="separator">
            {sectionDivider}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_min" className="text-[18px]">
                Salary min (e.g. 60000)
              </Label>
              <Input
                id="salary_min"
                type="number"
                min={0}
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="Optional"
                disabled={loading}
                className={fieldInputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_max" className="text-[18px]">
                Salary max (e.g. 90000)
              </Label>
              <Input
                id="salary_max"
                type="number"
                min={0}
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="Optional"
                disabled={loading}
                className={fieldInputClass}
              />
            </div>
          </div>
          <div className="py-6" role="separator">
            {sectionDivider}
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="text-[18px]">
              Location
            </Label>
            <Input
              id="location"
              list="location-options"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Remote, Europe, or City (for hybrid)"
              disabled={loading}
              className={fieldInputClass}
            />
            <datalist id="location-options">
              <option value="Remote" />
              <option value="Hybrid" />
              <option value="Europe" />
              <option value="North America" />
            </datalist>
          </div>
          <div className="py-6" role="separator">
            {sectionDivider}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="application_email" className="text-[18px]">
                Application email
              </Label>
              <Input
                id="application_email"
                type="email"
                value={applicationEmail}
                onChange={(e) => setApplicationEmail(e.target.value)}
                placeholder="e.g. jobs@company.com"
                disabled={loading}
                className={fieldInputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="application_url" className="text-[18px]">
                Application URL
              </Label>
              <Input
                id="application_url"
                type="url"
                value={applicationUrl}
                onChange={(e) => setApplicationUrl(e.target.value)}
                placeholder="e.g. https://company.com/careers/apply"
                disabled={loading}
                className={fieldInputClass}
              />
            </div>
          </div>
          <div className="py-6" role="separator">
            {sectionDivider}
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={isActive}
                onCheckedChange={(c) => setIsActive(!!c)}
                disabled={loading}
              />
              <Label
                htmlFor="is_active"
                className="text-[18px] font-normal cursor-pointer"
              >
                Active (visible on job board)
              </Label>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="h-11 rounded-lg px-6 shadow-md hover:shadow-lg transition-shadow"
            >
              {loading ? "Saving…" : isEdit ? "Save changes" : "Create job"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-11 rounded-lg px-5 border-border/80 shadow-sm"
              asChild
            >
              <Link href="/employer/dashboard">Cancel</Link>
            </Button>
            {isEdit && deleteAction && (
              <Button
                type="button"
                variant="destructive"
                size="lg"
                className="h-11 rounded-lg px-5 shadow-sm"
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
