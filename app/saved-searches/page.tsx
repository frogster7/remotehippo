import Link from "next/link";
import { Briefcase } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSavedSearches } from "@/lib/saved-searches";
import { buildJobsQueryString, formatFiltersSummary } from "@/lib/job-filters";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteSearchButton } from "./delete-search-button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Searches | Niche Tech Job Board",
  description: "Your saved job searches",
};

export default async function SavedSearchesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/saved-searches");
  }

  const searches = await getSavedSearches(user.id);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-heading">
            Saved searches
          </h1>
          <p className="mt-2 text-muted-foreground">
            {searches.length === 0
              ? "You have no saved searches."
              : `${searches.length} saved ${searches.length === 1 ? "search" : "searches"}`}
          </p>
        </div>

        {searches.length === 0 ? (
          <Card className="rounded-3xl border border-dashed border-border/80 bg-card shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase
                className="mx-auto h-12 w-12 text-primary/70"
                aria-hidden
              />
              <p className="text-muted-foreground mt-4 mb-4">
                Save a search from the Jobs page to quickly run it again later.
              </p>
              <Link href="/jobs" className="text-primary font-medium hover:underline">
                Browse jobs →
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {searches.map((search) => {
              const queryString = buildJobsQueryString(search.filters);
              const summary = formatFiltersSummary(search.filters);
              return (
                <Card
                  key={search.id}
                  className="rounded-3xl border border-border/80 bg-card/95 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-semibold text-heading">
                          {search.name}
                        </h2>
                        {summary && (
                          <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button asChild size="sm">
                            <Link href={`/jobs${queryString}`}>Run search</Link>
                          </Button>
                          <DeleteSearchButton searchId={search.id} searchName={search.name} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
