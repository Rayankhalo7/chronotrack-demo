import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { durationMinutes } from "@/lib/time";
import { EntriesClient } from "@/components/entries/EntriesClient";

export default async function EntriesPage({
  searchParams,
}: {
  searchParams: { projectId?: string; from?: string; to?: string };
}) {
  const userId = await requireUserId();
  if (!userId) redirect("/login");

  const projectId = searchParams.projectId || undefined;
  const from = searchParams.from;
  const to = searchParams.to;

  const startedAtFilter: { gte?: Date; lte?: Date } = {};
  if (from) startedAtFilter.gte = new Date(from);
  if (to) startedAtFilter.lte = new Date(to);

  const [projects, entries] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
    prisma.timeEntry.findMany({
      where: {
        userId,
        ...(projectId ? { projectId } : {}),
        ...(from || to ? { startedAt: startedAtFilter } : {}),
      },
      include: { project: { select: { name: true, color: true } } },
      orderBy: { startedAt: "desc" },
    }),
  ]);

  const activeProjects = projects.filter((p) => !p.archived);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Entries</h1>
        <p className="text-sm text-slate-500">
          Filter by project and date range. Add manual entries below.
        </p>
      </div>
      <EntriesClient
        projects={projects.map((p) => ({
          id: p.id,
          name: p.name,
          color: p.color,
          archived: p.archived,
        }))}
        activeProjects={activeProjects.map((p) => ({
          id: p.id,
          name: p.name,
        }))}
        initialEntries={entries.map((e) => ({
          id: e.id,
          projectName: e.project.name,
          projectColor: e.project.color,
          startedAt: e.startedAt.toISOString(),
          endedAt: e.endedAt?.toISOString() ?? null,
          note: e.note,
          durationMinutes: durationMinutes(e.startedAt, e.endedAt),
        }))}
        filters={{
          projectId: projectId || "",
          from: from || "",
          to: to || "",
        }}
      />
    </div>
  );
}
