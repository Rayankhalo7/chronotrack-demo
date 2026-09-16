import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function HomePage() {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
        ChronoTrack
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Simple time tracking for focused work
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        Portfolio demo: projects, live timer, manual entries, dashboard totals,
        and CSV export. Sign in with the seeded demo account — no public
        registration.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
