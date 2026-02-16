import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Blog — coming soon.",
};

export default function BlogPage() {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-heading">Blog</h1>
      <p className="mt-2 text-muted-foreground">Coming soon.</p>
    </main>
  );
}
