import type { Metadata } from "next";
import Link from "next/link";
import { CompanyRegisterForm } from "./company-register-form";

export const metadata: Metadata = {
  title: "Sign up as Company | Niche Tech Job Board",
  description: "Create a company account to post jobs and receive applications.",
};

export default function RegisterCompanyPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Sign up as Company</h1>
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline">
              Log in
            </Link>
          </p>
        </div>
        <CompanyRegisterForm />
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
