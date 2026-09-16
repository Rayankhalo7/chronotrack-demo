"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Project = { id: string; name: string };

export function EntryForm({
  projects,
  onCreated,
}: {
  projects: Project[];
  onCreated?: () => void;
}) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(false);
    const res = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        startedAt: new Date(startedAt).toISOString(),
        endedAt: new Date(endedAt).toISOString(),
        note: note || null,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not create entry");
      return;
    }
    setOk(true);
    setNote("");
    onCreated?.();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-700">Project</span>
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          required
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <Input
        label="Started at"
        type="datetime-local"
        value={startedAt}
        onChange={(e) => setStartedAt(e.target.value)}
        required
      />
      <Input
        label="Ended at"
        type="datetime-local"
        value={endedAt}
        onChange={(e) => setEndedAt(e.target.value)}
        required
      />
      <Input
        label="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional"
      />
      <Button type="submit" disabled={busy || !projectId}>
        {busy ? "Saving…" : "Add entry"}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {ok ? <p className="text-sm text-emerald-600">Entry saved.</p> : null}
    </form>
  );
}
