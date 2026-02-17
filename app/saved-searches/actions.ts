"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createSavedSearch as createSavedSearchDb, deleteSavedSearch as deleteSavedSearchDb } from "@/lib/saved-searches";
import type { JobFilters } from "@/lib/types";

export async function createSavedSearchAction(
  name: string,
  filters: JobFilters
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/jobs");
  }
  const result = await createSavedSearchDb(user.id, name, filters);
  if (!result.error) {
    revalidatePath("/saved-searches");
  }
  return result;
}

export async function deleteSavedSearchAction(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/saved-searches");
  }
  const result = await deleteSavedSearchDb(id, user.id);
  if (!result.error) {
    revalidatePath("/saved-searches");
  }
  return result;
}
