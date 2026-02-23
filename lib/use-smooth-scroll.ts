"use client";

import { useCallback, useRef } from "react";

const DURATION_MS = 400;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Smoothly animate horizontal scroll. Returns a function to scroll left/right by a step. */
export function useSmoothScroll<T extends HTMLElement>(scrollRef: React.RefObject<T | null>) {
  const animRef = useRef<number | null>(null);

  const scrollBy = useCallback(
    (dir: "left" | "right", step: number) => {
      const el = scrollRef.current;
      if (!el) return;

      if (animRef.current != null) {
        cancelAnimationFrame(animRef.current);
      }

      const startLeft = el.scrollLeft;
      const targetLeft = startLeft + (dir === "left" ? -step : step);
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / DURATION_MS, 1);
        const eased = easeInOutCubic(progress);
        el.scrollLeft = startLeft + (targetLeft - startLeft) * eased;

        if (progress < 1) {
          animRef.current = requestAnimationFrame(tick);
        } else {
          animRef.current = null;
        }
      };

      animRef.current = requestAnimationFrame(tick);
    },
    [scrollRef],
  );

  return scrollBy;
}
