"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [banner, setBanner] = useState<string | null>(null);

  async function archive(id: string, archived: boolean) {
    setBanner(null);
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived }),
    });
    refresh();
  }

  async function remove(id: string) {
    setBanner(null);
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.status === 409) {
      setBanner("Project has entries — soft-archive instead.");
      return;
    }
    if (!res.ok) {
      setBanner("Could not delete project.");
      return;
    }
    refresh();
  }

  return (
    <div className="space-y-6">
      {banner ? (
        <div
          role="alert"
          className="rounded-none border border-border bg-panel px-4 py-3 text-sm text-foreground"
        >
          <div className="flex items-start justify-between gap-3">
            <p>{banner}</p>
            <button
              type="button"
              className="shrink-0 text-muted hover:text-foreground"
              onClick={() => setBanner(null)}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
      <Card>
        <ProjectForm onCreated={refresh} />
      </Card>
      {initial.length === 0 ? (
        <p className="rounded-none border border-dashed border-border p-6 text-center text-sm text-muted">
          No projects yet. Add one above to start tracking.
        </p>
      ) : (
        <ul className="space-y-3">
          {initial.map((p) => (
            <li
              key={p.id}
              className={`flex flex-col gap-3 rounded-none border border-border bg-panel p-4 sm:flex-row sm:items-center sm:justify-between ${
                p.archived ? "opacity-70" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ background: p.color || "#5C6B7A" }}
                />
                <div>
                  <Link
                    href={`/projects/${p.id}`}
                    className="font-medium text-foreground hover:text-accent"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-muted">
                    {p.entryCount} entries
                    {p.archived ? " · archived" : ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.archived ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => archive(p.id, false)}
                  >
                    Unarchive
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => archive(p.id, true)}
                  >
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
      )}
    </div>
  );
}
