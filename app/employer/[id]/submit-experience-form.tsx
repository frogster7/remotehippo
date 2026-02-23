"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitExperience } from "./actions";

export function SubmitExperienceForm({
  employerId,
  isLoggedIn,
}: {
  employerId: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <Link href={`/login?next=/employer/${employerId}#experiences`}>
        <Button>Share your experience</Button>
      </Link>
    );
  }

  if (submitted) {
    return (
      <p className="text-sm text-muted-foreground">
        Thanks! Your review is pending approval and will appear once the company
        approves it.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await submitExperience(employerId, content);
    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Share what it's like to work at this company..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className="resize-none"
        maxLength={2000}
        required
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
