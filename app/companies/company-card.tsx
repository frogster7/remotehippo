"use client";

import Link from "next/link";
import Image from "next/image";
import { ThumbsUp } from "lucide-react";
import type { CompanyCardData } from "@/lib/jobs";

const CARD_WIDTH = 288;

export function CompanyCard({ company }: { company: CompanyCardData }) {
  const name =
    company.company_name?.trim() || company.full_name?.trim() || "Company";

  return (
    <Link
      href={`/employer/${company.id}`}
      className="flex w-[288px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition hover:border-primary/30 hover:shadow-md scroll-snap-align-start"
    >
      {/* Header image */}
      <div className="relative h-32 w-full shrink-0 overflow-hidden bg-muted">
        {company.banner_url ? (
          <Image
            src={company.banner_url}
            alt=""
            fill
            className="object-cover"
            sizes={`${CARD_WIDTH}px`}
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.7) 100%)`,
            }}
          />
        )}
        {/* Logo overlay bottom-left */}
        <div className="absolute bottom-3 left-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          {company.company_logo_url ? (
            <Image
              src={company.company_logo_url}
              alt=""
              width={56}
              height={56}
              className="object-contain p-1"
            />
          ) : (
            <span className="text-sm font-semibold text-primary">
              {name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 pt-3">
        {/* Recommendations */}
        <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <ThumbsUp className="h-4 w-4" aria-hidden />
          <span>
            {company.recommendations_count}{" "}
            {company.recommendations_count === 1 ? "recommends" : "recommend"}
            {" people"}
          </span>
        </p>

        <h3 className="mt-1.5 font-heading text-lg font-bold leading-tight text-heading line-clamp-2">
          {name}
        </h3>

        {company.location_display && (
          <p className="mt-1 text-sm text-muted-foreground">
            {company.location_display}
          </p>
        )}

        {/* Action tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-lg bg-primary/15 px-3 py-1.5 text-sm font-medium text-foreground">
            {company.job_count.toLocaleString()} job{" "}
            {company.job_count === 1 ? "offer" : "offers"}
          </span>
          {company.benefits_count > 0 && (
            <span className="inline-flex items-center rounded-lg border border-border/80 bg-background px-3 py-1.5 text-sm font-medium text-foreground">
              additional benefits
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export { CARD_WIDTH };
