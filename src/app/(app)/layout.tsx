import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-semibold text-slate-900">
              ChronoTrack
            </Link>
            <nav className="flex gap-4 text-sm text-slate-600">
              <Link href="/dashboard" className="hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/projects" className="hover:text-slate-900">
                Projects
              </Link>
              <Link href="/entries" className="hover:text-slate-900">
                Entries
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="hidden sm:inline">{session.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
