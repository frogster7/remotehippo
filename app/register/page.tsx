import type { Metadata } from "next";
import Link from "next/link";
import { UserCircle, Building2, Sparkles, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign up | Niche Tech Job Board",
  description: "Create an account as a job seeker or as a company.",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/95 p-6 shadow-sm sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative space-y-4 text-center">
            <p className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
              Join niche tech teams
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
              Choose how you want to register
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
              Pick the account that matches your goal. You can sign in any time
              to manage jobs, applications, and your profile.
            </p>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline hover:no-underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 sm:grid-cols-2">
          <Link
            href="/register/user"
            className="group relative flex h-full flex-col rounded-3xl border border-border/80 bg-card/95 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="absolute right-4 top-4 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              Job seeker
            </div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
              <UserCircle className="h-7 w-7" aria-hidden />
            </div>
            <h2 className="text-lg font-semibold">Register as Job Seeker</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Looking for your next opportunity? Create an account to apply for
              jobs and save your favourites.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                Save roles you want to track
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                Apply quickly from your profile
              </li>
            </ul>
            <span className="mt-4 text-sm font-medium text-primary group-hover:underline">
              Sign up as job seeker →
            </span>
          </Link>

          <Link
            href="/register/company"
            className="group relative flex h-full flex-col rounded-3xl border border-border/80 bg-card/95 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="absolute right-4 top-4 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              Company
            </div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
              <Building2 className="h-7 w-7" aria-hidden />
            </div>
            <h2 className="text-lg font-semibold">Register as Company</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Hiring? Create a company account to post jobs and receive
              applications.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                Publish and manage active listings
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                Review applications in one place
              </li>
            </ul>
            <span className="mt-4 text-sm font-medium text-primary group-hover:underline">
              Sign up as company →
            </span>
          </Link>
        </section>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/" className="underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
