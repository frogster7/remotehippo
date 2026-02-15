"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Toggle favorite: add if not exists, remove if exists.
 * Returns the new state: true if now favorited, false if unfavorited.
 */
export async function toggleFavorite(
  jobId: string,
): Promise<{ success: true; isFavorited: boolean } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to save jobs." };
  }

  // Check if already favorited
  const { data: existing, error: checkError } = await supabase
    .from("job_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    // PGRST116 = not found (expected when not favorited)
    console.error("toggleFavorite checkError:", checkError);
    return { error: "Failed to check favorite status." };
  }

  if (existing) {
    // Remove favorite
    const { error: deleteError } = await supabase
      .from("job_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("job_id", jobId);

    if (deleteError) {
      console.error("toggleFavorite deleteError:", deleteError);
      return { error: "Failed to remove favorite." };
    }

    revalidatePath("/saved-jobs");
    revalidatePath("/jobs");
    return { success: true, isFavorited: false };
  } else {
    // Add favorite
    const { error: insertError } = await supabase
      .from("job_favorites")
      .insert({ user_id: user.id, job_id: jobId });

    if (insertError) {
      console.error("toggleFavorite insertError:", insertError);
      return { error: "Failed to add favorite." };
    }

    revalidatePath("/saved-jobs");
    revalidatePath("/jobs");
    return { success: true, isFavorited: true };
  }
}

/** Ensure user is logged in; redirect to login with ?next if not. */
export async function ensureLoggedIn(currentPath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  }
}
