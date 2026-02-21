"use client";

import { useState } from "react";
import { BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createSavedSearchAction } from "@/app/saved-searches/actions";
import type { JobFilters } from "@/lib/types";

export function SaveSearchButton({ filters }: { filters: JobFilters }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createSavedSearchAction(name.trim(), filters);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setName("");
    setOpen(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setError(null);
      setName("");
    }
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl border-border/80 bg-card/95"
        >
          <BookmarkPlus className="h-4 w-4" />
          Save this search
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Save search</DialogTitle>
            <DialogDescription>
              Give this search a name to find it later in Saved searches.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="save-search-name">Name</Label>
              <Input
                id="save-search-name"
                placeholder="e.g. Remote React Berlin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={200}
                required
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
