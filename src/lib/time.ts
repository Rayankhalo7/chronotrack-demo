import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  differenceInMinutes,
  differenceInSeconds,
} from "date-fns";

/** Week starts Monday (ISO). */
export function getWeekBounds(date: Date = new Date()): {
  start: Date;
  end: Date;
} {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function getTodayBounds(date: Date = new Date()): {
  start: Date;
  end: Date;
} {
  return {
    start: startOfDay(date),
    end: endOfDay(date),
  };
}

/** Duration in whole minutes for completed entries. Returns null if incomplete. */
export function durationMinutes(
  startedAt: Date,
  endedAt: Date | null | undefined
): number | null {
  if (!endedAt) return null;
  if (endedAt.getTime() <= startedAt.getTime()) return 0;
  return differenceInMinutes(endedAt, startedAt);
}

/** Live elapsed seconds (for running timer display). */
export function elapsedSeconds(
  startedAt: Date,
  now: Date = new Date()
): number {
  return Math.max(0, differenceInSeconds(now, startedAt));
}

/** Format seconds as HH:MM:SS */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}

/** Format minutes as human-readable e.g. "1h 30m" */
export function formatMinutes(minutes: number): string {
  const m = Math.max(0, Math.floor(minutes));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}m`;
  if (rem === 0) return `${h}h`;
  return `${h}h ${rem}m`;
}

export type EntryTimeInput = {
  startedAt: Date;
  endedAt: Date | null;
};

/** Validate that endedAt is after startedAt when present. */
export function isValidEntryRange(
  startedAt: Date,
  endedAt: Date | null | undefined
): boolean {
  if (!endedAt) return true;
  return endedAt.getTime() > startedAt.getTime();
}

/**
 * True if two closed intervals overlap (half-open [start, end)).
 * Running timers (endedAt null) are treated as extending to `now`.
 */
export function entriesOverlap(
  a: EntryTimeInput,
  b: EntryTimeInput,
  now: Date = new Date()
): boolean {
  const aEnd = a.endedAt ?? now;
  const bEnd = b.endedAt ?? now;
  return (
    a.startedAt.getTime() < bEnd.getTime() &&
    b.startedAt.getTime() < aEnd.getTime()
  );
}

/** Sum duration minutes for completed entries only. */
export function sumDurationMinutes(
  entries: Array<{ startedAt: Date; endedAt: Date | null }>
): number {
  return entries.reduce((acc, e) => {
    const d = durationMinutes(e.startedAt, e.endedAt);
    return acc + (d ?? 0);
  }, 0);
}
