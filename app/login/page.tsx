import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log in | Niche Tech Job Board",
  description: "Sign in to your account.",
};

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 rounded-3xl border border-border/80 bg-card/95 p-6 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-heading">Log in</h1>
          <p className="text-muted-foreground text-sm">
            Don’t have an account?{" "}
            <Link href="/register" className="text-primary underline">
              Sign up
            </Link>
          </p>
        </div>
        <LoginForm redirectTo={next ?? "/"} />
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
