import { createClient } from "@/lib/supabase/server";
import type { JobFilters, SavedSearch } from "@/lib/types";

const MAX_SAVED_SEARCHES_PER_USER = 20;
const MAX_NAME_LENGTH = 200;

export async function getSavedSearches(userId: string): Promise<SavedSearch[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_searches")
    .select("id, user_id, name, filters, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SavedSearch[];
}

export async function createSavedSearch(
  userId: string,
  name: string,
  filters: JobFilters
): Promise<{ id?: string; error?: string }> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Name is required." };
  if (trimmed.length > MAX_NAME_LENGTH) return { error: `Name must be at most ${MAX_NAME_LENGTH} characters.` };

  const supabase = await createClient();
  const { count } = await supabase
    .from("saved_searches")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if ((count ?? 0) >= MAX_SAVED_SEARCHES_PER_USER) {
    return { error: `You can save at most ${MAX_SAVED_SEARCHES_PER_USER} searches.` };
  }

  const { data, error } = await supabase
    .from("saved_searches")
    .insert({ user_id: userId, name: trimmed, filters: filters as Record<string, unknown> })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data?.id };
}

export async function deleteSavedSearch(id: string, userId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("saved_searches")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { error: error.message };
  return {};
}
