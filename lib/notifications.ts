import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/lib/types";

export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);
  if (error) return 0;
  return count ?? 0;
}

export async function getNotifications(
  userId: string,
  limit = 20
): Promise<Notification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, user_id, type, payload, read_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as Notification[];
}

/** Call DB function to create job_alert notifications for users whose saved search matches the job. */
export async function notifyJobAlert(jobId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("notify_job_alert", { p_job_id: jobId });
  // Ignore errors (e.g. function not yet deployed); notifications are non-blocking
}
