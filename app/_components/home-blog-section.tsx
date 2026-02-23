"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

/** Mock blog post for homepage. Replace with real data later. */
const MOCK_POSTS = [
  {
    id: "1",
    title: "How to stand out in remote tech interviews",
    excerpt:
      "Practical tips for preparing and presenting your best self when interviewing remotely.",
    date: "Feb 20, 2025",
    slug: "#",
  },
  {
    id: "2",
    title: "Salary transparency in job ads: what we learned",
    excerpt:
      "Why we show salary ranges and how it affects application quality.",
    date: "Feb 14, 2025",
    slug: "#",
  },
  {
    id: "3",
    title: "Best practices for async engineering teams",
    excerpt: "Keeping teams aligned and productive across time zones.",
    date: "Feb 8, 2025",
    slug: "#",
  },
];

/** Zero-based position in the list of sections. Even = white bg, odd = muted. */
export function HomeBlogSection({ sectionIndex }: { sectionIndex: number }) {
  const isWhite = sectionIndex % 2 === 0;
  const sectionClassName = isWhite ? "bg-white" : "bg-muted/50";
  return (
    <section className={`py-8 md:py-10 pb-[15vh] ${sectionClassName}`}>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-heading md:text-3xl text-left mb-8 flex items-center gap-3">
            <span className="flex shrink-0 text-primary" aria-hidden>
              <BookOpen className="h-6 w-6 md:h-7 md:w-7" />
            </span>
            From the blog
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_POSTS.map((post) => (
              <li key={post.id}>
                <Link
                  href={post.slug}
                  className="group block rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:bg-card/95 border-l-4 border-l-primary/50"
                >
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {post.date}
                  </p>
                  <h3 className="mt-2 font-heading text-lg font-bold leading-tight text-heading group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Read more
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
