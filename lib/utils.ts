import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Extract display filename from a storage path (e.g. CV or timestamped filename). Safe for server and client. */
export function getCvFileName(path: string): string {
  const parts = path.split("/");
  const full = parts[parts.length - 1] ?? "";
  const withoutTimestamp = full.replace(/^\d+-/, "");
  return decodeURIComponent(withoutTimestamp) || "CV";
}
