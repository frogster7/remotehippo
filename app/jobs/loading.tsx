import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobsLoading() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-5 w-80" />
        </div>

        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[180px]">
              <Skeleton className="mb-1 h-3 w-14" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="min-w-[140px]">
              <Skeleton className="mb-1 h-3 w-10" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="min-w-[120px]">
              <Skeleton className="mb-1 h-3 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="min-w-[120px]">
              <Skeleton className="mb-1 h-3 w-14" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        <section className="mt-8 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-5 w-[75%]" />
                    <Skeleton className="mt-2 h-4 w-1/2" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-14" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-10" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
