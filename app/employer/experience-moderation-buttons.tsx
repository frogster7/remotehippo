"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { approveExperience, rejectExperience } from "./actions";

export function ExperienceModerationButtons({ experienceId }: { experienceId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      await approveExperience(experienceId);
      router.refresh();
    });
  }

  function handleReject() {
    startTransition(async () => {
      await rejectExperience(experienceId);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        onClick={handleApprove}
        disabled={isPending}
      >
        {isPending ? "…" : "Approve"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleReject}
        disabled={isPending}
      >
        Reject
      </Button>
    </div>
  );
}
