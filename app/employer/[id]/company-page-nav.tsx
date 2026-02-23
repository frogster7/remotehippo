"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SECTION_LABELS: Record<string, string> = {
  about: "About",
  "open-positions": "Jobs",
  benefits: "Benefits",
  "hiring-process": "Hiring process",
  gallery: "Gallery",
};

type Props = {
  visibleSectionIds: string[];
};

export function CompanyPageNav({ visibleSectionIds }: Props) {
  const pathname = usePathname();
  const [activeId, setActiveId] = useState<string>(
    visibleSectionIds[0] ?? ""
  );

  useEffect(() => {
    if (visibleSectionIds.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    visibleSectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pathname, visibleSectionIds]);

  if (visibleSectionIds.length === 0) return null;

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-1 overflow-x-auto py-2 min-w-max"
      aria-label="Page sections"
    >
      {visibleSectionIds.map((sectionId) => {
        const isActive = activeId === sectionId;
        const label = SECTION_LABELS[sectionId] ?? sectionId;
        return (
          <a
            key={sectionId}
            href={`#${sectionId}`}
            className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground ${
              isActive
                ? "bg-primary/15 text-primary font-semibold"
                : "text-muted-foreground"
            }`}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}
