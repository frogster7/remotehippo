import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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

  return (
    <header className="border-b border-primary/100 bg-[#fdfdfc]">
      <div
        className="mx-auto max-w-[1200px] h-14 flex items-center justify-between"
        suppressHydrationWarning
      >
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="shrink-0 font-semibold text-primary hover:text-primary/90"
          >
            Niche Tech Job Board
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-base">
            <Link
              href="/jobs"
              className="text-muted-foreground hover:text-foreground font-medium"
            >
              Jobs
            </Link>
            <Link
              href="/blog"
              className="text-muted-foreground hover:text-foreground font-medium"
            >
              Blog
            </Link>
          </nav>
        </div>
        <HeaderNav
          user={user}
          isEmployer={profile?.role === "employer"}
          firstName={firstName}
        />
      </div>
    </header>
  );
}
