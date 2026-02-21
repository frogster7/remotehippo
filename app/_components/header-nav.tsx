"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BellRing,
  Briefcase,
  ChevronDown,
  FileInput,
  FileText,
  Heart,
  Home,
  LayoutDashboard,
  Menu,
  Sparkles,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { markNotificationRead, markAllNotificationsRead } from "@/app/notifications/actions";

const linkClass =
  "text-muted-foreground hover:text-foreground block py-2 text-base font-medium transition-colors";

export type NavNotification = {
  id: string;
  payload: { job_slug?: string; job_title?: string; saved_search_name?: string };
  read_at: string | null;
};

export type SavedJobForNav = {
  id: string;
  slug: string;
  title: string;
  employer?: { company_name?: string | null; full_name?: string | null; company_logo_url?: string | null } | null;
};

interface HeaderNavProps {
  user: { id: string; email?: string | null } | null;
  isEmployer: boolean;
  firstName: string | null;
  unreadNotificationCount: number;
  notifications: NavNotification[];
  savedJobs: SavedJobForNav[];
}

type NavItem = { href: string; label: string } | { type: "signout"; label: string };

export function HeaderNav({
  user,
  isEmployer,
  firstName,
  unreadNotificationCount = 0,
  notifications = [],
  savedJobs = [],
}: HeaderNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    window.location.href = "/";
  }

  const dashboardHref = isEmployer ? "/employer/dashboard" : "/dashboard";
  const savedJobsHref = isEmployer ? "/saved-jobs" : "/dashboard?panel=saved-jobs";
  const applicationsHref = isEmployer
    ? "/my-applications"
    : "/dashboard?panel=applications";
  const savedSearchesHref = isEmployer
    ? "/saved-searches"
    : "/dashboard?panel=saved-searches";
  const editHref = isEmployer ? "/profile" : "/dashboard?panel=edit-profile";
  const offersHref = isEmployer ? "/employer/dashboard" : "/dashboard?panel=offers";
  const documentsHref = isEmployer ? "/employer/dashboard" : "/dashboard?panel=documents";
  const notificationsPanelHref = isEmployer ? "/employer/dashboard" : "/dashboard?panel=notifications";

  const accountMenuItems = isEmployer
    ? [
        { href: dashboardHref, label: "Your desktop", icon: LayoutDashboard },
        { href: applicationsHref, label: "My applications", icon: Briefcase },
        { href: savedJobsHref, label: "Saved", icon: Heart },
        { href: documentsHref, label: "Documents", icon: FileText },
        { href: notificationsPanelHref, label: "Notifications", icon: BellRing },
      ]
    : [
        { href: dashboardHref, label: "Your desktop", icon: Home },
        { href: offersHref, label: "Offers tailored to you", icon: Sparkles },
        { href: applicationsHref, label: "My applications", icon: Briefcase },
        { href: savedJobsHref, label: "Saved", icon: Heart },
        { href: documentsHref, label: "Documents", icon: FileText },
        { href: documentsHref, label: "CV Creator", icon: FileInput },
        { href: notificationsPanelHref, label: "Notifications", icon: BellRing },
      ];

  const navLinks: NavItem[] = [
    { href: "/jobs", label: "Jobs" },
    { href: "/blog", label: "Blog" },
    ...(user
      ? [
          { href: savedJobsHref, label: "Saved Jobs" },
          { href: applicationsHref, label: "My applications" },
          { href: savedSearchesHref, label: "Saved searches" },
          { href: editHref, label: "Edit" },
          { type: "signout" as const, label: "Sign out" },
        ]
      : [
          { href: "/login", label: "Log in" },
          { href: "/register", label: "Sign up" },
        ]),
  ];

  return (
    <>
      {/* Desktop nav (right side only; Jobs + Blog are in header next to logo) */}
      <nav className="hidden md:flex items-center gap-3 text-base">
        {user ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-muted/70 text-[#202557] hover:bg-muted transition-colors"
                  aria-label="Saved jobs"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Saved jobs</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {savedJobs.length === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No saved jobs yet.
                  </div>
                ) : (
                  savedJobs.slice(0, 5).map((job) => {
                    const companyName = job.employer?.company_name ?? job.employer?.full_name ?? "Company";
                    return (
                      <div
                        key={job.id}
                        className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50"
                      >
                        {job.employer?.company_logo_url ? (
                          <Image
                            src={job.employer.company_logo_url}
                            alt=""
                            width={36}
                            height={36}
                            className="rounded-lg object-cover shrink-0"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">
                            {companyName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{job.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{companyName}</p>
                        </div>
                        <Button asChild size="sm" className="shrink-0">
                          <Link href={`/jobs/${job.slug}`}>Apply</Link>
                        </Button>
                      </div>
                    );
                  })
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={savedJobsHref} className="text-[#202557] cursor-pointer">
                    View all
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 rounded-full bg-muted/70 text-[#202557] hover:bg-muted transition-colors"
                  aria-label={
                    unreadNotificationCount > 0
                      ? `Notifications (${unreadNotificationCount} unread)`
                      : "Notifications"
                  }
                >
                  <BellRing className="h-4 w-4" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                      {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const slug = n.payload?.job_slug;
                    const title = n.payload?.job_title ?? "Job";
                    const searchName = n.payload?.saved_search_name;
                    const label = searchName
                      ? `New job matching "${searchName}": ${title}`
                      : title;
                    return (
                      <DropdownMenuItem key={n.id} asChild>
                        <Link
                          href={slug ? `/jobs/${slug}` : "/dashboard"}
                          className="block py-2"
                          onClick={async () => {
                            setNotificationsOpen(false);
                            if (!n.read_at) {
                              await markNotificationRead(n.id);
                              router.refresh();
                            }
                          }}
                        >
                          <span className="line-clamp-2 text-sm">{label}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })
                )}
                <DropdownMenuSeparator />
                {unreadNotificationCount > 0 && (
                  <DropdownMenuItem
                    onClick={async () => {
                      await markAllNotificationsRead();
                      setNotificationsOpen(false);
                      router.refresh();
                    }}
                  >
                    Mark all as read
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard?panel=notifications" onClick={() => setNotificationsOpen(false)}>
                    View all
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  className="h-9 shrink-0 gap-2 rounded-full bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90"
                  aria-label="Account menu"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="truncate max-w-[100px]">
                    My account
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <div className="flex items-center gap-3 px-2 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <span className="truncate text-sm font-semibold text-[#202557]">
                    {user.email ?? "Account"}
                  </span>
                </div>
                <DropdownMenuSeparator />
                {accountMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href + item.label} asChild>
                      <Link
                        href={item.href}
                        className="flex items-center gap-2 text-[#202557] cursor-pointer"
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-[#202557] cursor-pointer">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-[#202557] hover:text-[#202557]/80 font-medium transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-[#202557] font-semibold hover:text-[#202557]/80 transition-colors"
            >
              Sign up
            </Link>
          </>
        )}
      </nav>

      {/* Mobile: hamburger + sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[280px] border-l border-border/80 bg-card/95"
        >
          <SheetHeader>
            <SheetTitle className="sr-only">Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 pt-6">
            {navLinks.map((item) =>
              "href" in item ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    linkClass +
                    (pathname === item.href ? " text-foreground" : "")
                  }
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ) : item.type === "signout" ? (
                <button
                  key="signout"
                  type="button"
                  className={linkClass + " w-full text-left"}
                  onClick={handleSignOut}
                >
                  {item.label}
                </button>
              ) : null,
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
