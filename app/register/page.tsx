import type { Metadata } from "next";
import Link from "next/link";
import { UserCircle, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign up | Niche Tech Job Board",
  description: "Create an account as a job seeker or as a company.",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Create an account</h1>
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline">
              Log in
            </Link>
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/register/user"
            className="group flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
              <UserCircle className="h-7 w-7" aria-hidden />
            </div>
            <h2 className="text-lg font-semibold">Register as Job Seeker</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Looking for your next opportunity? Create an account to apply for
              jobs and save your favourites.
            </p>
            <span className="mt-4 text-sm font-medium text-primary group-hover:underline">
              Sign up as job seeker →
            </span>
          </Link>

          <Link
            href="/register/company"
            className="group flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
              <Building2 className="h-7 w-7" aria-hidden />
            </div>
            <h2 className="text-lg font-semibold">Register as Company</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Hiring? Create a company account to post jobs and receive
              applications.
            </p>
            <span className="mt-4 text-sm font-medium text-primary group-hover:underline">
              Sign up as company →
            </span>
          </Link>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
