import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default async function HomePage() {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <Link href="/" className="font-semibold text-accent">
            ChronoTrack
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto flex max-w-3xl flex-col justify-center px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Simple time tracking for focused work
        </h1>
        <p className="mt-4 text-lg text-mutedStrong">
          Portfolio demo: projects, live timer, manual entries, dashboard totals,
          and CSV export. Sign in with the seeded demo account — no public
          registration.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accentHover dark:text-[#0C0F14]"
          >
            Sign in
          </Link>
          <p className="text-sm text-muted">Demo account — see README</p>
        </div>
      </main>
    </div>
  );
}
