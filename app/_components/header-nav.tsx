"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Heart, Menu, User } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const linkClass =
  "text-muted-foreground hover:text-foreground block py-2 text-base font-medium transition-colors";

interface HeaderNavProps {
  user: { id: string } | null;
  isEmployer: boolean;
  firstName: string | null;
}

export function HeaderNav({ user, isEmployer, firstName }: HeaderNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    window.location.href = "/";
  }

  const navLinks = [
    { href: "/jobs", label: "Jobs" },
    { href: "/blog", label: "Blog" },
    ...(user
          ? [
          { href: "/saved-jobs", label: "Saved Jobs" },
          { href: "/my-applications", label: "My applications" },
          { href: "/saved-searches", label: "Saved searches" },
          ...(isEmployer
            ? [{ href: "/employer/dashboard", label: "Dashboard" }]
            : []),
          { href: "/profile", label: "Edit" },
          { type: "signout" as const, label: "Sign out" },
        ]
      : [
          { href: "/login", label: "Log in" },
          { href: "/register", label: "Sign up" },
        ]),
  ].flat();

  return (
    <>
      {/* Desktop nav (right side only; Jobs + Blog are in header next to logo) */}
      <nav className="hidden md:flex items-center gap-5 text-base">
        {user ? (
          <>
            <Link
              href="/saved-jobs"
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted/80 transition-colors"
              aria-label="Saved jobs"
            >
              <Heart className="h-5 w-5" />
            </Link>
            {isEmployer && (
              <Link
                href="/employer/dashboard"
                className="text-muted-foreground hover:text-foreground font-medium"
              >
                Dashboard
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-full shrink-0 gap-2 px-3 h-9 font-semibold text-heading hover:bg-muted/80"
                  aria-label="Account menu"
                >
                  <User className="h-5 w-5 shrink-0" />
                  {firstName ? (
                    <span className="truncate max-w-[120px]">{firstName}</span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/saved-jobs">Saved Jobs</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-applications">My applications</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/saved-searches">Saved searches</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground font-medium"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-primary font-semibold hover:underline"
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
        <SheetContent side="right" className="w-[280px]">
          <SheetHeader>
            <SheetTitle className="sr-only">Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 pt-6">
            {navLinks.map((item, i) =>
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
