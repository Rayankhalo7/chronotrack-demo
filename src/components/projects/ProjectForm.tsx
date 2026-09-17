"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ProjectForm({ onCreated }: { onCreated?: () => void }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#2F5BFF");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not create project");
      return;
    }
    setName("");
    onCreated?.();
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <Input
          label="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Website redesign"
        />
      </div>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-muted-strong">Color</span>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-[4px] border border-border bg-panel"
        />
      </label>
      <Button type="submit" disabled={busy || !name.trim()}>
        {busy ? "Adding…" : "Add project"}
      </Button>
      {error ? (
        <p className="text-sm text-danger sm:basis-full">{error}</p>
      ) : null}
    </form>
  );
}
