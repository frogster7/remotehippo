import Link from "next/link";
import Image from "next/image";
import { Briefcase, Building2, FileText } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/80 bg-card/95">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2 font-semibold text-primary hover:text-primary/90 transition-colors w-fit"
            >
              <Image
                src="/logo.png"
                alt="RemoteHippo"
                width={120}
                height={36}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground max-w-[260px]">
              Remote-friendly tech jobs. For Balkan developers and companies hiring remote talent.
            </p>
          </div>

          {/* Jobs & Blog */}
          <div>
            <h3 className="font-heading font-semibold text-heading text-sm uppercase tracking-wider mb-4">
              Explore
            </h3>
            <nav className="flex flex-col gap-3">
              <Link
                href="/jobs"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-heading transition-colors"
              >
                <Briefcase className="h-4 w-4" />
                Browse jobs
              </Link>
              <Link
                href="/blog"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-heading transition-colors"
              >
                <FileText className="h-4 w-4" />
                Blog
              </Link>
            </nav>
          </div>

          {/* Employers */}
          <div>
            <h3 className="font-heading font-semibold text-heading text-sm uppercase tracking-wider mb-4">
              Employers
            </h3>
            <nav className="flex flex-col gap-3">
              <Link
                href="/register/company"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-heading transition-colors"
              >
                <Building2 className="h-4 w-4" />
                Post a job
              </Link>
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-heading transition-colors"
              >
                Sign in
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Niche Tech Job Board. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6 text-xs">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-heading transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-heading transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
