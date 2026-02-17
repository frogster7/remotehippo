"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteSavedSearchAction } from "./actions";

export function DeleteSearchButton({ searchId, searchName }: { searchId: string; searchName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${searchName}"?`)) return;
    setLoading(true);
    const result = await deleteSavedSearchAction(searchId);
    setLoading(false);
    if (!result.error) {
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-destructive"
      onClick={handleDelete}
      disabled={loading}
      aria-label={`Delete saved search "${searchName}"`}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
