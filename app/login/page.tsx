import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { LoginForm } from "./login-form";
import { GoogleOneTap } from "@/app/_components/google-one-tap";

export const metadata: Metadata = {
  title: "Log in | Niche Tech Job Board",
  description: "Sign in to your account.",
};

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const redirectTo = next ?? "/";
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
        <GoogleOneTap redirectTo={redirectTo} />
      )}
      <div className="container mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/95 p-6 shadow-sm sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative text-center">
            <p className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
              Welcome back
            </p>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
              Log in to your account
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Continue your job search, manage applications, or review company
              postings.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Don’t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary underline hover:no-underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-[1fr_420px] md:items-start">
          <div className="rounded-3xl border border-border/80 bg-card/95 p-6 shadow-sm">
            <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="text-lg font-semibold text-heading">
              Fast and secure access
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                Sign in with email and password
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                Use Google for one-click authentication
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                Return directly to your intended page
              </li>
            </ul>
          </div>

          <div className="w-full">
            <LoginForm redirectTo={next ?? "/"} />
          </div>
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
