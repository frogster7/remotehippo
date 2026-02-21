"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Banner = { id: string; url: string };

export function BannerSlider({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (banners.length === 0) return null;

  if (banners.length === 1) {
    return (
      <div className="relative mx-auto h-[280px] max-h-[280px] w-full max-w-[1200px] overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-muted/20 to-primary/5 shadow-sm">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative size-full">
          <Image
            src={banners[0].url}
            alt="Company banner"
            fill
            className="object-fill"
            priority
            unoptimized
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-[280px] max-h-[280px] w-full max-w-[1200px] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-muted/20 to-primary/5 shadow-md">
      <div
        className="absolute inset-0 opacity-[0.03] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            i === index ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={b.url}
            alt={`Company banner ${i + 1}`}
            fill
            className="object-cover"
            priority={i === 0}
            unoptimized
          />
        </div>
      ))}
      <Button
        variant="secondary"
        size="icon"
        className="absolute left-2 top-1/2 z-20 h-9 w-9 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100"
        onClick={() =>
          setIndex((i) => (i - 1 + banners.length) % banners.length)
        }
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="absolute right-2 top-1/2 z-20 h-9 w-9 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100"
        onClick={() => setIndex((i) => (i + 1) % banners.length)}
        aria-label="Next banner"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-5 bg-primary/90" : "w-2 bg-primary/40"
            }`}
            aria-label={`Go to banner ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
