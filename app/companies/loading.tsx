import { Skeleton } from "@/components/ui/skeleton";

export default function CompaniesLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto max-w-[1200px] px-4 py-10">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-96" />
        <div className="mt-8 flex gap-2">
          <Skeleton className="h-11 flex-1" />
          <Skeleton className="h-11 w-24" />
        </div>
        <div className="mt-8 flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-72 shrink-0 rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
