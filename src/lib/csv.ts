import { durationMinutes } from "./time";

export type CsvEntry = {
  id: string;
  projectName: string;
  startedAt: Date;
  endedAt: Date | null;
  note: string | null;
};

const HEADER = [
  "id",
  "project",
  "startedAt",
  "endedAt",
  "durationMinutes",
  "note",
] as const;

function escapeCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Build UTF-8 CSV with header, ISO-8601 times, duration in minutes. */
export function entriesToCsv(entries: CsvEntry[]): string {
  const lines: string[] = [HEADER.join(",")];

  for (const e of entries) {
    const mins = durationMinutes(e.startedAt, e.endedAt);
    const row = [
      e.id,
      escapeCell(e.projectName),
      e.startedAt.toISOString(),
      e.endedAt ? e.endedAt.toISOString() : "",
      mins === null ? "" : String(mins),
      escapeCell(e.note ?? ""),
    ];
    lines.push(row.join(","));
  }

  return "\uFEFF" + lines.join("\n") + "\n";
}
