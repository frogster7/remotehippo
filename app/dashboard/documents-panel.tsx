"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  addCvToUserCvs,
  deleteCvFromUserCvs,
  addCoverLetterToUser,
  deleteCoverLetterFromUser,
  setDefaultCv,
  setDefaultCoverLetter,
} from "@/app/profile/actions";
import {
  CV_ALLOWED_EXTENSIONS,
  isAllowedCvFileName,
} from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilePlus, Download, Trash2 } from "lucide-react";

const CV_ACCEPT = ".pdf,.doc,.docx";

export type CvWithUrl = {
  id: string;
  storage_path: string;
  display_name: string | null;
  downloadUrl: string | null;
  fileName: string;
  created_at?: string;
  is_default?: boolean;
};

export type CoverLetterWithUrl = {
  id: string;
  storage_path: string;
  display_name: string | null;
  downloadUrl: string | null;
  fileName: string;
  created_at?: string;
  is_default?: boolean;
};

function formatAddedDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  } catch {
    return "";
  }
}

function UploadZone({
  label,
  hint,
  onFile,
  disabled,
  accept,
}: {
  label: string;
  hint: string;
  onFile: (file: File) => void;
  disabled: boolean;
  accept: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file && isAllowedCvFileName(file.name)) onFile(file);
    },
    [disabled, onFile]
  );
  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);
  const handleClick = () => inputRef.current?.click();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = "";
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      disabled={disabled}
      className="flex min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/70 bg-muted/20 px-4 py-6 transition-colors hover:border-primary/50 hover:bg-muted/30 disabled:opacity-50 disabled:hover:border-border/70 disabled:hover:bg-muted/20"
    >
      <FilePlus className="h-10 w-10 text-muted-foreground" />
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">{hint}</span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
    </button>
  );
}

export function DocumentsPanel({
  cvs,
  coverLetters,
}: {
  cvs: CvWithUrl[];
  coverLetters: CoverLetterWithUrl[];
}) {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [cvLoading, setCvLoading] = useState(false);
  const [clLoading, setClLoading] = useState(false);

  const maxCvsReached = cvs.length >= 3;
  const maxCoverLettersReached = coverLetters.length >= 5;

  async function handleCvFile(file: File) {
    if (!isAllowedCvFileName(file.name)) {
      setError(`Allowed formats: ${CV_ALLOWED_EXTENSIONS.join(", ")}`);
      return;
    }
    setError(null);
    setCvLoading(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await addCvToUserCvs(formData);
    setCvLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDeleteCv(cvId: string) {
    setError(null);
    setCvLoading(true);
    const result = await deleteCvFromUserCvs(cvId);
    setCvLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleCoverLetterFile(file: File) {
    if (!isAllowedCvFileName(file.name)) {
      setError(`Allowed formats: ${CV_ALLOWED_EXTENSIONS.join(", ")}`);
      return;
    }
    setError(null);
    setClLoading(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await addCoverLetterToUser(formData);
    setClLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDeleteCoverLetter(clId: string) {
    setError(null);
    setClLoading(true);
    const result = await deleteCoverLetterFromUser(clId);
    setClLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleSetDefaultCv(cvId: string) {
    setError(null);
    const result = await setDefaultCv(cvId);
    if (result.error) setError(result.error);
    else router.refresh();
  }

  async function handleSetDefaultCoverLetter(clId: string) {
    setError(null);
    const result = await setDefaultCoverLetter(clId);
    if (result.error) setError(result.error);
    else router.refresh();
  }

  return (
    <div className="space-y-6">
      {error && (
          <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">{error}</p>
        )}

        <section>
          <h3 className="text-base font-semibold text-heading mb-4">CV</h3>
          <div className="flex flex-wrap gap-4">
            {cvs.map((cv) => (
              <div
                key={cv.id}
                className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-4 min-w-[200px] max-w-[280px]"
              >
                <div className="flex items-center gap-2">
                  {cv.is_default && (
                    <Badge
                      variant="secondary"
                      className="w-fit rounded-full bg-green-500/15 text-green-700 dark:text-green-400"
                    >
                      Default for applying
                    </Badge>
                  )}
                  {!cv.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleSetDefaultCv(cv.id)}
                      disabled={cvLoading}
                    >
                      Set as default
                    </Button>
                  )}
                </div>
                <span className="truncate text-sm font-medium">{cv.fileName}</span>
                {cv.created_at && (
                  <span className="text-xs text-muted-foreground">
                    added: {formatAddedDate(cv.created_at)}
                  </span>
                )}
                <div className="mt-auto flex gap-2">
                  {cv.downloadUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      asChild
                    >
                      <a href={cv.downloadUrl} target="_blank" rel="noopener noreferrer" title="Download">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteCv(cv.id)}
                    disabled={cvLoading}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {!maxCvsReached && (
              <div className="min-w-[200px] max-w-[280px]">
                <UploadZone
                  label="Add CV"
                  hint="or drag them here"
                  onFile={handleCvFile}
                  disabled={cvLoading}
                  accept={CV_ACCEPT}
                />
              </div>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-base font-semibold text-heading mb-4">Other documents</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Cover letters and other supporting documents. You can add up to 5.
          </p>
          <div className="flex flex-wrap gap-4">
            {coverLetters.map((cl) => (
              <div
                key={cl.id}
                className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-4 min-w-[200px] max-w-[280px]"
              >
                <div className="flex items-center gap-2">
                  {cl.is_default && (
                    <Badge
                      variant="secondary"
                      className="w-fit rounded-full bg-green-500/15 text-green-700 dark:text-green-400"
                    >
                      Default
                    </Badge>
                  )}
                  {!cl.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleSetDefaultCoverLetter(cl.id)}
                      disabled={clLoading}
                    >
                      Set as default
                    </Button>
                  )}
                </div>
                <span className="truncate text-sm font-medium">{cl.fileName}</span>
                {cl.created_at && (
                  <span className="text-xs text-muted-foreground">
                    added: {formatAddedDate(cl.created_at)}
                  </span>
                )}
                <div className="mt-auto flex gap-2">
                  {cl.downloadUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      asChild
                    >
                      <a href={cl.downloadUrl} target="_blank" rel="noopener noreferrer" title="Download">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteCoverLetter(cl.id)}
                    disabled={clLoading}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {!maxCoverLettersReached && (
              <div className="min-w-[200px] max-w-[280px]">
                <UploadZone
                  label="Add file"
                  hint="or drag it here"
                  onFile={handleCoverLetterFile}
                  disabled={clLoading}
                  accept={CV_ACCEPT}
                />
              </div>
            )}
          </div>
        </section>
    </div>
  );
}
