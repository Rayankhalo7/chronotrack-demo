"use client";

import { formatMinutes } from "@/lib/time";
import { Button } from "@/components/ui/Button";

export type EntryRow = {
  id: string;
  projectName?: string;
  projectColor?: string | null;
  startedAt: string;
  endedAt: string | null;
  note: string | null;
  durationMinutes: number | null;
};

export function EntryTable({
  entries,
  onDeleted,
}: {
  entries: EntryRow[];
  onDeleted?: () => void;
}) {
  async function remove(id: string) {
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
    if (res.ok) onDeleted?.();
  }

  if (entries.length === 0) {
    return (
      <p className="rounded-none border border-dashed border-border p-6 text-center text-sm text-muted">
        No entries for this filter.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-none border border-border bg-panel">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border text-muted">
          <tr>
            <th className="px-4 py-2.5 font-medium">Project</th>
            <th className="px-4 py-2.5 font-medium">Start</th>
            <th className="px-4 py-2.5 font-medium">End</th>
            <th className="px-4 py-2.5 font-medium">Duration</th>
            <th className="px-4 py-2.5 font-medium">Note</th>
            <th className="px-4 py-2.5 font-medium" />
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => {
            const running = !e.endedAt;
            return (
              <tr
                key={e.id}
                className="border-t border-border hover:bg-background"
              >
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: e.projectColor || "#5C6B7A" }}
                    />
                    {e.projectName || "—"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-muted-strong">
                  {new Date(e.startedAt).toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-muted-strong">
                  {running ? (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full bg-success"
                        aria-hidden="true"
                      />
                      Running
                    </span>
                  ) : (
                    new Date(e.endedAt!).toLocaleString()
                  )}
                </td>
                <td className="px-4 py-2.5 tabular-nums">
                  {e.durationMinutes != null
                    ? formatMinutes(e.durationMinutes)
                    : "—"}
                </td>
                <td className="px-4 py-2.5 text-muted">{e.note || "—"}</td>
                <td className="px-4 py-2.5 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(e.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
