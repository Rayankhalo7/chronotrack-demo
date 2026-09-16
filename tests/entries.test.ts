import { describe, it, expect } from "vitest";
import {
  assertCanStartTimer,
  assertHasActiveTimer,
  assertValidRange,
  EntryRuleError,
} from "../src/lib/entries";
import { entriesToCsv } from "../src/lib/csv";

describe("active timer rules", () => {
  it("blocks second active timer", () => {
    expect(() => assertCanStartTimer(1)).toThrow(EntryRuleError);
    expect(() => assertCanStartTimer(0)).not.toThrow();
  });

  it("requires active timer to stop", () => {
    expect(() => assertHasActiveTimer(0)).toThrow(EntryRuleError);
    expect(() => assertHasActiveTimer(1)).not.toThrow();
  });
});

describe("entry range rules", () => {
  it("rejects endedAt <= startedAt", () => {
    const t = new Date("2026-01-01T10:00:00Z");
    expect(() => assertValidRange(t, t)).toThrow(EntryRuleError);
    expect(() =>
      assertValidRange(t, new Date("2026-01-01T09:00:00Z"))
    ).toThrow(EntryRuleError);
  });

  it("allows valid completed range and running", () => {
    const start = new Date("2026-01-01T10:00:00Z");
    expect(() =>
      assertValidRange(start, new Date("2026-01-01T11:00:00Z"))
    ).not.toThrow();
    expect(() => assertValidRange(start, null)).not.toThrow();
  });
});

describe("CSV export format", () => {
  it("includes header, ISO times, duration minutes, UTF-8 BOM", () => {
    const csv = entriesToCsv([
      {
        id: "e1",
        projectName: "Portfolio",
        startedAt: new Date("2026-01-01T10:00:00.000Z"),
        endedAt: new Date("2026-01-01T11:30:00.000Z"),
        note: 'Hello, "world"',
      },
    ]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain(
      "id,project,startedAt,endedAt,durationMinutes,note"
    );
    expect(csv).toContain("2026-01-01T10:00:00.000Z");
    expect(csv).toContain("2026-01-01T11:30:00.000Z");
    expect(csv).toContain(",90,");
    expect(csv).toContain('"Hello, ""world"""');
  });
});
