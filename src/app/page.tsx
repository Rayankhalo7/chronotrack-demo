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
          <Link
            href="/"
            className="font-display text-base font-bold tracking-tight text-foreground"
          >
            ChronoTrack
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto flex max-w-3xl flex-col justify-center px-6 py-16">
        <div className="rail">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Simple time tracking for focused work
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-strong">
            Portfolio demo: projects, live timer, manual entries, dashboard
            totals, and CSV export. Sign in with the seeded demo account — no
            public registration.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-[4px] bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover dark:text-[#0E141C]"
            >
              Sign in
            </Link>
            <p className="text-sm text-muted">Demo account — see README</p>
          </div>
        </div>
      </main>
    </div>
  );
}
