import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployerPublicLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="mb-6 h-5 w-28" />
        <Skeleton className="mb-6 h-[200px] w-full rounded-2xl" />
        <Card className="mb-6 rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mb-6 flex gap-2 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-10 w-24 shrink-0 rounded-md" />
          ))}
        </div>
        <div className="space-y-8">
          <div>
            <Skeleton className="mb-4 h-5 w-20" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div>
            <Skeleton className="mb-4 h-5 w-36" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
