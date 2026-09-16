import { describe, it, expect } from "vitest";
import {
  durationMinutes,
  formatDuration,
  formatMinutes,
  getWeekBounds,
  isValidEntryRange,
  entriesOverlap,
  sumDurationMinutes,
  elapsedSeconds,
} from "../src/lib/time";

describe("durationMinutes", () => {
  it("returns null for running timer", () => {
    expect(durationMinutes(new Date(), null)).toBeNull();
  });

  it("returns whole minutes for completed entry", () => {
    const start = new Date("2026-01-01T10:00:00.000Z");
    const end = new Date("2026-01-01T11:30:00.000Z");
    expect(durationMinutes(start, end)).toBe(90);
  });

  it("returns 0 when endedAt <= startedAt", () => {
    const t = new Date("2026-01-01T10:00:00.000Z");
    expect(durationMinutes(t, t)).toBe(0);
  });
});

describe("formatDuration / formatMinutes", () => {
  it("formats HH:MM:SS", () => {
    expect(formatDuration(3661)).toBe("01:01:01");
    expect(formatDuration(0)).toBe("00:00:00");
  });

  it("formats human minutes", () => {
    expect(formatMinutes(90)).toBe("1h 30m");
    expect(formatMinutes(45)).toBe("45m");
    expect(formatMinutes(120)).toBe("2h");
  });
});

describe("getWeekBounds", () => {
  it("starts on Monday (ISO)", () => {
    // 2026-09-17 is Thursday
    const { start, end } = getWeekBounds(new Date("2026-09-17T12:00:00"));
    expect(start.getDay()).toBe(1);
    expect(end.getDay()).toBe(0);
  });
});

describe("isValidEntryRange", () => {
  it("allows null endedAt", () => {
    expect(isValidEntryRange(new Date(), null)).toBe(true);
  });

  it("requires endedAt after startedAt", () => {
    const a = new Date("2026-01-01T10:00:00Z");
    const b = new Date("2026-01-01T09:00:00Z");
    expect(isValidEntryRange(a, b)).toBe(false);
    expect(isValidEntryRange(a, new Date("2026-01-01T11:00:00Z"))).toBe(true);
  });
});

describe("entriesOverlap", () => {
  it("detects overlap", () => {
    const a = {
      startedAt: new Date("2026-01-01T10:00:00Z"),
      endedAt: new Date("2026-01-01T12:00:00Z"),
    };
    const b = {
      startedAt: new Date("2026-01-01T11:00:00Z"),
      endedAt: new Date("2026-01-01T13:00:00Z"),
    };
    expect(entriesOverlap(a, b)).toBe(true);
  });

  it("no overlap when adjacent", () => {
    const a = {
      startedAt: new Date("2026-01-01T10:00:00Z"),
      endedAt: new Date("2026-01-01T11:00:00Z"),
    };
    const b = {
      startedAt: new Date("2026-01-01T11:00:00Z"),
      endedAt: new Date("2026-01-01T12:00:00Z"),
    };
    expect(entriesOverlap(a, b)).toBe(false);
  });
});

describe("sumDurationMinutes", () => {
  it("ignores running timers", () => {
    const sum = sumDurationMinutes([
      {
        startedAt: new Date("2026-01-01T10:00:00Z"),
        endedAt: new Date("2026-01-01T11:00:00Z"),
      },
      {
        startedAt: new Date("2026-01-01T12:00:00Z"),
        endedAt: null,
      },
    ]);
    expect(sum).toBe(60);
  });
});

describe("elapsedSeconds", () => {
  it("is non-negative", () => {
    const start = new Date(Date.now() - 5000);
    expect(elapsedSeconds(start)).toBeGreaterThanOrEqual(4);
  });
});
