import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen p-6">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Niche Tech Job Board</h1>
        <p className="mt-2 text-muted-foreground max-w-md">
          Remote-friendly tech jobs · EU timezone · For Balkan developers and companies hiring remote talent
        </p>
        <Button asChild className="mt-6">
          <Link href="/jobs">Browse jobs</Link>
        </Button>
      </div>
    </main>
  );
}
