import type { Metadata } from "next";
import Link from "next/link";
import { CompanyRegisterForm } from "./company-register-form";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign up as Company | Niche Tech Job Board",
  description: "Create a company account to post jobs and receive applications.",
};

export default function RegisterCompanyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Choose account type
        </Link>

        <header className="mb-10 mt-8 rounded-3xl border border-border/80 bg-card/95 p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
            Sign up as Company
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline hover:no-underline">
              Log in
            </Link>
          </p>
        </header>

        <div className="mt-2">
          <CompanyRegisterForm />
        </div>
      </div>
    </main>
  );
}
