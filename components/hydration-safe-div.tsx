"use client";

import { forwardRef, type ComponentProps } from "react";

/**
 * A div that suppresses hydration warnings for itself.
 * Use when a browser extension (e.g. Bitdefender) injects attributes like bis_skin_checked
 * into the DOM after server render, causing server HTML to not match client.
 * Only suppresses for this element (React's suppressHydrationWarning is one level deep).
 */
export const HydrationSafeDiv = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  function HydrationSafeDiv(props, ref) {
    return <div ref={ref} {...props} suppressHydrationWarning />;
  }
);
