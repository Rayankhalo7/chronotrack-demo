"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { elapsedSeconds, formatDuration } from "@/lib/time";

type Project = { id: string; name: string; color: string | null };
type Active = {
  id: string;
  projectId: string;
  projectName: string;
  startedAt: string;
} | null;

export function TimerBar({
  projects,
  initialActive,
  onChanged,
}: {
  projects: Project[];
  initialActive: Active;
  onChanged?: () => void;
}) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [active, setActive] = useState<Active>(initialActive);
  const [tick, setTick] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActive(initialActive);
  }, [initialActive]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [active]);

  async function start() {
    if (!projectId) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/entries/active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not start timer");
      return;
    }
    const data = await res.json();
    setActive(data);
    onChanged?.();
  }

  async function stop() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/entries/active", { method: "PATCH" });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not stop timer");
      return;
    }
    setActive(null);
    onChanged?.();
  }

  const seconds = active
    ? elapsedSeconds(new Date(active.startedAt)) + tick * 0
    : 0;
  // recompute from startedAt each tick
  void tick;
  const display = active
    ? formatDuration(elapsedSeconds(new Date(active.startedAt)))
    : "00:00:00";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {active ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Running
            </p>
            <p className="text-lg font-semibold text-slate-900">
              {active.projectName}
            </p>
          </div>
        ) : (
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:max-w-xs"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            {projects.length === 0 ? (
              <option value="">No active projects</option>
            ) : (
              projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))
            )}
          </select>
        )}
        <p className="font-mono text-2xl font-semibold tabular-nums text-slate-900">
          {display}
        </p>
      </div>
      <div className="flex gap-2">
        {active ? (
          <Button variant="danger" disabled={busy} onClick={stop}>
            Stop
          </Button>
        ) : (
          <Button disabled={busy || !projectId} onClick={start}>
            Start
          </Button>
        )}
      </div>
      {error ? <p className="w-full text-sm text-red-600 sm:basis-full">{error}</p> : null}
      {/* silence unused */}
      <span className="hidden">{seconds}</span>
    </div>
  );
}
