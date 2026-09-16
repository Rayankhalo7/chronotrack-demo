"use client";

import { useRouter } from "next/navigation";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  color: string | null;
  archived: boolean;
  entryCount: number;
};

export function ProjectsClient({ initial }: { initial: Project[] }) {
  const router = useRouter();
  const refresh = () => router.refresh();

  async function archive(id: string, archived: boolean) {
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived }),
    });
    refresh();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.status === 409) {
      alert("Project has entries — soft-archive instead.");
      return;
    }
    if (!res.ok) {
      alert("Could not delete project");
      return;
    }
    refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <ProjectForm onCreated={refresh} />
      </Card>
      <ul className="space-y-3">
        {initial.map((p) => (
          <li
            key={p.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-4 w-4 rounded-full"
                style={{ background: p.color || "#94a3b8" }}
              />
              <div>
                <Link
                  href={`/projects/${p.id}`}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {p.name}
                </Link>
                <p className="text-xs text-slate-500">
                  {p.entryCount} entries
                  {p.archived ? " · archived" : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.archived ? (
                <Button size="sm" variant="secondary" onClick={() => archive(p.id, false)}>
                  Unarchive
                </Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => archive(p.id, true)}>
                  Archive
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => remove(p.id)}
                disabled={p.entryCount > 0}
                title={
                  p.entryCount > 0
                    ? "Has entries — use archive"
                    : "Delete project"
                }
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
