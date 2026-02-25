"use client";

import { Button } from "@/components/ui/button";

interface JobApplyCardProps {
  isClosed: boolean;
  applyHref: string | null;
  applyLabel: string;
  applyNote: string;
  shareUrl: string;
  jobTitle: string;
}

export function JobApplyCard({
  isClosed,
  applyHref,
  applyLabel,
}: JobApplyCardProps) {
  return (
    <div className="rounded-3xl bg-card p-5 shadow-md">
      {isClosed ? (
        <p className="text-sm text-muted-foreground">
          This position has been filled. Applications are no longer accepted.
        </p>
      ) : (
        applyHref && (
          <Button asChild size="lg" className="w-full rounded-lg">
            <a
              href={applyHref}
              {...(applyHref.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" as const }
                : {})}
            >
              {applyLabel}
            </a>
          </Button>
        )
      )}
    </div>
  );
}
