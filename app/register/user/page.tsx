import type { Metadata } from "next";
import Link from "next/link";
import { UserRegisterForm } from "./user-register-form";

export const metadata: Metadata = {
  title: "Sign up as Job Seeker | Niche Tech Job Board",
  description: "Create a job seeker account to apply for jobs.",
};

export default function RegisterUserPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 rounded-3xl border border-border/80 bg-card/95 p-6 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-heading">Sign up as Job Seeker</h1>
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline">
              Log in
            </Link>
          </p>
        </div>
        <UserRegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/register" className="underline">
            ← Choose account type
          </Link>
          {" · "}
          <Link href="/" className="underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
