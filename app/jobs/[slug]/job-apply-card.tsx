"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
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
  applyNote,
  shareUrl,
  jobTitle,
}: JobApplyCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: jobTitle,
          url: shareUrl,
          text: jobTitle,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      {isClosed ? (
        <p className="text-sm text-muted-foreground">
          This position has been filled. Applications are no longer accepted.
        </p>
      ) : (
        <>
          {applyHref && (
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
          )}
          <p className="mt-2 text-xs text-muted-foreground">{applyNote}</p>
        </>
      )}
      <Button
        variant="outline"
        size="sm"
        className="mt-4 w-full gap-2 rounded-lg"
        onClick={handleShare}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" aria-hidden />
            Link copied
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" aria-hidden />
            Share
          </>
        )}
      </Button>
    </div>
  );
}
