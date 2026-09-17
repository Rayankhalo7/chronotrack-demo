import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { durationMinutes } from "@/lib/time";
import { EntryTable } from "@/components/entries/EntryTable";
import Link from "next/link";

type Props = { params: { id: string } };

export default async function ProjectDetailPage({ params }: Props) {
  const userId = await requireUserId();
  if (!userId) redirect("/login");

  const project = await prisma.project.findFirst({
    where: { id: params.id, userId },
  });
  if (!project) notFound();

  const entries = await prisma.timeEntry.findMany({
    where: { userId, projectId: project.id },
    include: { project: { select: { name: true, color: true } } },
    orderBy: { startedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/projects" className="text-sm text-accent hover:underline">
          ← Projects
        </Link>
        <h1 className="mt-2 flex items-center gap-3 text-2xl font-bold text-foreground">
          <span
            className="inline-block h-4 w-4 rounded-full"
            style={{ background: project.color || "#5C6B7A" }}
          />
          {project.name}
          {project.archived ? (
            <span className="rounded-[4px] border border-border px-2 py-0.5 text-xs font-medium text-muted-strong">
              archived
            </span>
          ) : null}
        </h1>
      </div>
      <EntryTable
        entries={entries.map((e) => ({
          id: e.id,
          projectName: e.project.name,
          projectColor: e.project.color,
          startedAt: e.startedAt.toISOString(),
          endedAt: e.endedAt?.toISOString() ?? null,
          note: e.note,
          durationMinutes: durationMinutes(e.startedAt, e.endedAt),
        }))}
      />
    </div>
  );
}
