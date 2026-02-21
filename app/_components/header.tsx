import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getUnreadNotificationCount, getNotifications } from "@/lib/notifications";
import { getFavoritedJobs } from "@/lib/jobs";
import { HeaderNav } from "./header-nav";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user
    ? await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single()
        .then((r) => r.data)
    : null;

  const firstName = profile?.full_name?.trim().split(/\s+/)[0] ?? null;
  const unreadNotificationCount = user
    ? await getUnreadNotificationCount(user.id)
    : 0;
  const notifications = user ? await getNotifications(user.id, 10) : [];
  const savedJobs = user ? await getFavoritedJobs(user.id) : [];

  return (
    <header className="border-b border-border/80 bg-card/95">
      <div
        className="mx-auto max-w-[1200px] h-14 flex items-center justify-between"
        suppressHydrationWarning
      >
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 font-semibold text-primary hover:text-primary/90"
          >
            <Image
              src="/logo.png"
              alt="RemoteHippo"
              width={120}
              height={36}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-base">
            <Link
              href="/jobs"
              className="text-[#202557] hover:text-[#202557]/80 font-medium transition-colors"
            >
              Jobs
            </Link>
            <Link
              href="/blog"
              className="text-[#202557] hover:text-[#202557]/80 font-medium transition-colors"
            >
              Blog
            </Link>
          </nav>
        </div>
        <HeaderNav
          user={user ? { id: user.id, email: user.email ?? null } : null}
          isEmployer={profile?.role === "employer"}
          firstName={firstName}
          unreadNotificationCount={unreadNotificationCount}
          notifications={notifications}
          savedJobs={savedJobs}
        />
      </div>
    </header>
  );
}
