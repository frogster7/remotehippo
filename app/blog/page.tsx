import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Blog — coming soon.",
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 p-6">
      <div className="mx-auto max-w-2xl rounded-3xl border border-border/80 bg-card/95 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-heading">Blog</h1>
        <p className="mt-2 text-muted-foreground">Coming soon.</p>
      </div>
    </main>
  );
}
