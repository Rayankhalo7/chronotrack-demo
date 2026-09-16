"use client";

import { useRouter } from "next/navigation";
import { TimerBar } from "@/components/entries/TimerBar";
import { EntryTable, EntryRow } from "@/components/entries/EntryTable";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export function DashboardClient({
  projects,
  initialActive,
  initialEntries,
}: {
  projects: { id: string; name: string; color: string | null }[];
  initialActive: {
    id: string;
    projectId: string;
    projectName: string;
    startedAt: string;
  } | null;
  initialEntries: EntryRow[];
}) {
  const router = useRouter();
  const refresh = () => router.refresh();

  return (
    <div className="space-y-6">
      <TimerBar
        projects={projects}
        initialActive={initialActive}
        onChanged={refresh}
      />
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Recent entries</h2>
        <div className="flex gap-3 text-sm">
          <Link href="/entries" className="text-blue-600 hover:underline">
            All entries
          </Link>
          <a
            href="/api/export/csv"
            className="text-blue-600 hover:underline"
          >
            Export CSV
          </a>
        </div>
      </div>
      <EntryTable entries={initialEntries} onDeleted={refresh} />
      {projects.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">
            No projects yet.{" "}
            <Link href="/projects" className="text-blue-600 hover:underline">
              Create one
            </Link>{" "}
            to start the timer.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
