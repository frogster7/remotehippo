"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { closeJob, reopenJob } from "./actions";

export function CloseReopenButton({
  jobId,
  closedAt,
}: {
  jobId: string;
  closedAt: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const isClosed = !!closedAt;

  function handleClose() {
    startTransition(async () => {
      await closeJob(jobId);
    });
  }

  function handleReopen() {
    startTransition(async () => {
      await reopenJob(jobId);
    });
  }

  return isClosed ? (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReopen}
      disabled={isPending}
    >
      {isPending ? "Reopening…" : "Reopen listing"}
    </Button>
  ) : (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClose}
      disabled={isPending}
    >
      {isPending ? "Closing…" : "Close listing"}
    </Button>
  );
}
