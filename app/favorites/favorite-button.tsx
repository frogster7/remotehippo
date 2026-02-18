"use client";

import { useState, useTransition } from "react";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/app/favorites/actions";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  jobId: string;
  initialIsFavorited: boolean;
  isLoggedIn: boolean;
  variant?: "default" | "ghost" | "icon";
  icon?: "heart" | "star";
  className?: string;
}

export function FavoriteButton({
  jobId,
  initialIsFavorited,
  isLoggedIn,
  variant = "default",
  icon = "heart",
  className = "",
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = () => {
    if (!isLoggedIn) {
      // Redirect to login
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    startTransition(async () => {
      const result = await toggleFavorite(jobId);
      if ("error" in result) {
        alert(result.error);
      } else {
        setIsFavorited(result.isFavorited);
      }
    });
  };

  if (variant === "icon") {
    const Icon = icon === "star" ? Star : Heart;
    return (
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`p-1.5 rounded-full hover:bg-accent transition-colors ${className}`}
        aria-label={isFavorited ? "Remove from saved jobs" : "Save job"}
      >
        <Icon
          className={`h-4 w-4 ${
            isFavorited
              ? "fill-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        />
      </button>
    );
  }

  const Icon = icon === "star" ? Star : Heart;
  return (
    <Button
      onClick={handleToggle}
      disabled={isPending}
      variant={variant === "ghost" ? "ghost" : "outline"}
      className={className}
    >
      <Icon
        className={`h-4 w-4 mr-2 ${isFavorited ? "fill-primary text-primary" : ""}`}
      />
      {isFavorited ? "Saved" : "Save job"}
    </Button>
  );
}
