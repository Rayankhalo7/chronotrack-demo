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
      <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        No entries for this filter.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Project</th>
            <th className="px-4 py-3 font-medium">Start</th>
            <th className="px-4 py-3 font-medium">End</th>
            <th className="px-4 py-3 font-medium">Duration</th>
            <th className="px-4 py-3 font-medium">Note</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} className="border-t border-slate-100">
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: e.projectColor || "#94a3b8" }}
                  />
                  {e.projectName || "—"}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                {new Date(e.startedAt).toLocaleString()}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                {e.endedAt ? new Date(e.endedAt).toLocaleString() : "Running"}
              </td>
              <td className="px-4 py-3">
                {e.durationMinutes != null
                  ? formatMinutes(e.durationMinutes)
                  : "—"}
              </td>
              <td className="px-4 py-3 text-slate-600">{e.note || "—"}</td>
              <td className="px-4 py-3 text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(e.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
