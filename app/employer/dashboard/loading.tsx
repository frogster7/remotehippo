import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployerDashboardLoading() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-8 w-56" />
            <Skeleton className="mt-1 h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        <section className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="mt-2 h-4 w-32" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-14" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex flex-wrap items-center gap-2">
                <Skeleton className="h-9 w-14" />
                <Skeleton className="h-9 w-12" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
