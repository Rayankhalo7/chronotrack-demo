import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProjectsClient } from "@/components/projects/ProjectsClient";

export default async function ProjectsPage() {
  const userId = await requireUserId();
  if (!userId) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { userId },
    include: { _count: { select: { entries: true } } },
    orderBy: [{ archived: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        <p className="text-sm text-muted">
          Soft-archive projects that have entries. Hard-delete only when empty.
        </p>
      </div>
      <ProjectsClient
        initial={projects.map((p) => ({
          id: p.id,
          name: p.name,
          color: p.color,
          archived: p.archived,
          entryCount: p._count.entries,
        }))}
      />
    </div>
  );
}
