"use client";

import { useRouter } from "next/navigation";
import { EntryForm } from "@/components/entries/EntryForm";
import { EntryTable, EntryRow } from "@/components/entries/EntryTable";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export function EntriesClient({
  projects,
  activeProjects,
  initialEntries,
  filters,
}: {
  projects: { id: string; name: string; color: string | null; archived: boolean }[];
  activeProjects: { id: string; name: string }[];
  initialEntries: EntryRow[];
  filters: { projectId: string; from: string; to: string };
}) {
  const router = useRouter();
  const [projectId, setProjectId] = useState(filters.projectId);
  const [from, setFrom] = useState(filters.from.slice(0, 10));
  const [to, setTo] = useState(filters.to.slice(0, 10));

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (projectId) params.set("projectId", projectId);
    if (from) params.set("from", new Date(from).toISOString());
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      params.set("to", end.toISOString());
    }
    router.push(`/entries?${params.toString()}`);
  }

  const exportHref = (() => {
    const params = new URLSearchParams();
    if (filters.projectId) params.set("projectId", filters.projectId);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    const q = params.toString();
    return `/api/export/csv${q ? `?${q}` : ""}`;
  })();

  return (
    <div className="space-y-6">
      <Card>
        <form
          onSubmit={applyFilters}
          className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <label className="block space-y-1">
            <span className="text-sm font-medium text-muted-strong">Project</span>
            <select
              className="rounded-[4px] border border-border bg-panel px-3 py-2 text-sm text-foreground"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">All</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.archived ? " (archived)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-muted-strong">From</span>
            <input
              type="date"
              className="rounded-[4px] border border-border bg-panel px-3 py-2 text-sm text-foreground"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-muted-strong">To</span>
            <input
              type="date"
              className="rounded-[4px] border border-border bg-panel px-3 py-2 text-sm text-foreground"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <Button type="submit" variant="secondary">
            Apply
          </Button>
          <a
            href={exportHref}
            className="inline-flex items-center justify-center rounded-[4px] bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover dark:text-[#0E141C]"
          >
            Export CSV
          </a>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Manual entry
        </h2>
        <EntryForm
          projects={activeProjects}
          onCreated={() => router.refresh()}
        />
      </Card>

      <EntryTable
        entries={initialEntries}
        onDeleted={() => router.refresh()}
      />
    </div>
  );
}
