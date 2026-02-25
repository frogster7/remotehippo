"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type GalleryItem = { id: string; url: string; caption: string | null };

type Props = {
  items: GalleryItem[];
};

export function GalleryLightbox({ items }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const current = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) setIndex((i) => i - 1);
  }, [hasPrev]);

  const goNext = useCallback(() => {
    if (hasNext) setIndex((i) => i + 1);
  }, [hasNext]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close, goPrev, goNext]);

  if (items.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
            className="group relative aspect-video overflow-hidden rounded-xl border border-border/60 transition-shadow hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
          >
            <Image
              src={item.url}
              alt={item.caption ?? "Gallery image"}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 33vw"
              unoptimized
            />
            {item.caption?.trim() && (
              <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-xs text-white">
                {item.caption}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox overlay – lighter backdrop so page is slightly visible */}
      {open && current && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/75"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image viewer"
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 z-10 rounded-full p-2 text-white/90 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close"
          >
            <X className="h-8 w-8" />
          </button>

          {hasPrev && (
            <Button
              variant="ghost"
              size="icon"
              onClick={goPrev}
              className="absolute left-2 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20 md:left-4"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {hasNext && (
            <Button
              variant="ghost"
              size="icon"
              onClick={goNext}
              className="absolute right-2 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20 md:right-4"
              aria-label="Next image"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          <button
            type="button"
            onClick={close}
            className="absolute inset-0 z-0 focus:outline-none"
            tabIndex={-1}
            aria-hidden
          />

          <div
            className="relative z-[1] mx-4 flex max-h-[75vh] max-w-4xl flex-1 flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              key={index}
              className="relative max-h-[65vh] w-full flex-1 animate-in fade-in-0 duration-300"
            >
              <Image
                src={current.url}
                alt={current.caption ?? "Gallery image"}
                fill
                className="object-contain"
                sizes="(max-width: 896px) 100vw, 896px"
                unoptimized
              />
            </div>
            {current.caption?.trim() && (
              <p className="mt-3 max-w-2xl text-center text-sm text-white/90">
                {current.caption}
              </p>
            )}
            <p className="mt-1 text-xs text-white/60">
              {index + 1} / {items.length}
            </p>
          </div>

          {/* Bottom thumbnail strip – previews of all images */}
          <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-black/40 py-3 backdrop-blur-sm">
            <div className="mx-auto flex max-w-4xl justify-center gap-2 overflow-x-auto px-4 scrollbar-thin">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-white/50 ${
                    i === index
                      ? "border-primary ring-2 ring-primary/50"
                      : "border-white/20 opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`View image ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                >
                  <Image
                    src={item.url}
                    alt=""
                    width={80}
                    height={56}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
