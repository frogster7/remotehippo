import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployerDashboardLoading() {
  return (
    <main className="min-h-screen bg-[#f4f5fb]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="mt-2 h-5 w-80" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit lg:sticky lg:top-20">
            <Card className="rounded-2xl border border-border/60 bg-white">
              <CardContent className="p-4">
                <div className="mb-4 rounded-xl border border-border/60 bg-muted/20 p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                </div>
                <nav className="space-y-1">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-9 w-full rounded-md" />
                  ))}
                </nav>
              </CardContent>
            </Card>
          </aside>

          <div>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="h-full rounded-2xl border border-border/50 bg-white">
                  <CardContent className="flex items-center gap-4 p-5">
                    <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
                    <div className="space-y-1">
                      <Skeleton className="h-7 w-12" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="rounded-2xl border border-border/50 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-10 w-28" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
