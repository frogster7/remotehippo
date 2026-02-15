"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const linkClass =
  "text-muted-foreground hover:text-foreground block py-2 text-sm font-medium transition-colors";

interface HeaderNavProps {
  user: { id: string } | null;
  isEmployer: boolean;
}

export function HeaderNav({ user, isEmployer }: HeaderNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/jobs", label: "Jobs" },
    ...(user
      ? [
          { href: "/saved-jobs", label: "Saved Jobs" },
          ...(isEmployer ? [{ href: "/employer/dashboard", label: "Dashboard" }] : []),
          { href: "/profile", label: "Profile" },
        ]
      : [
          { href: "/login", label: "Log in" },
          { href: "/register", label: "Sign up" },
        ]),
  ].flat();

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-4 text-sm">
        <Link href="/jobs" className="text-muted-foreground hover:text-foreground">
          Jobs
        </Link>
        {user ? (
          <>
            <Link
              href="/saved-jobs"
              className="text-muted-foreground hover:text-foreground"
            >
              Saved Jobs
            </Link>
            {isEmployer && (
              <Link
                href="/employer/dashboard"
                className="text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Link>
            )}
            <Link
              href="/profile"
              className="text-muted-foreground hover:text-foreground"
            >
              Profile
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
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
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={linkClass + (pathname === href ? " text-foreground" : "")}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
