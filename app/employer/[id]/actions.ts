"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Submit an experience/review for a company. Requires auth. Inserts with status 'pending'. */
export async function submitExperience(
  employerId: string,
  content: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to share your experience." };
  }

  const trimmed = content?.trim();
  if (!trimmed || trimmed.length < 10) {
    return { error: "Please write at least a few words about your experience." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();
  if (!profile) {
    return { error: "Profile not found. Please complete your profile first." };
  }

  const { error } = await supabase.from("company_experiences").insert({
    employer_id: employerId,
    author_id: user.id,
    content: trimmed,
    status: "pending",
  });
  if (error) return { error: error.message };

  revalidatePath(`/employer/${employerId}`);
  revalidatePath("/employer/dashboard");
  return {};
}
