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
        .select("role")
        .eq("id", user.id)
        .single()
        .then((r) => r.data)
    : null;

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between" suppressHydrationWarning>
        <Link href="/" className="shrink-0 font-semibold text-primary hover:text-primary/90">
          Niche Tech Job Board
        </Link>
        <HeaderNav user={user} isEmployer={profile?.role === "employer"} />
      </div>
    </header>
  );
}
