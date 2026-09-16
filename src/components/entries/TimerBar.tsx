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
  sticky = false,
}: {
  projects: Project[];
  initialActive: Active;
  onChanged?: () => void;
  sticky?: boolean;
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
  void tick;
  const display = active
    ? formatDuration(elapsedSeconds(new Date(active.startedAt)))
    : "00:00:00";

  const shouldStick = sticky || Boolean(active);

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between ${
        shouldStick ? "sticky top-14 z-30 shadow-sm" : ""
      }`}
    >
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        {active ? (
          <div className="flex items-start gap-2">
            <span
              className="mt-2 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-success"
              aria-hidden="true"
            />
            <div>
              <p className="text-xs font-medium text-muted">Running</p>
              <p className="text-lg font-semibold text-foreground">
                {active.projectName}
              </p>
            </div>
          </div>
        ) : (
          <label className="block w-full space-y-1 sm:max-w-xs">
            <span className="text-sm font-medium text-mutedStrong">Project</span>
            <select
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
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
          </label>
        )}
        <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">
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
      {error ? (
        <p className="w-full text-sm text-danger sm:basis-full">{error}</p>
      ) : null}
      <span className="hidden">{seconds}</span>
    </div>
  );
}
