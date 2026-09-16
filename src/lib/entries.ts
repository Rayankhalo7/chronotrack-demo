import { isValidEntryRange } from "./time";

export class EntryRuleError extends Error {
  constructor(
    message: string,
    public code: "ACTIVE_TIMER_EXISTS" | "INVALID_RANGE" | "NO_ACTIVE_TIMER"
  ) {
    super(message);
    this.name = "EntryRuleError";
  }
}

/** Ensure at most one active timer per user (caller supplies current active count). */
export function assertCanStartTimer(activeCount: number): void {
  if (activeCount > 0) {
    throw new EntryRuleError(
      "An active timer already exists. Stop it before starting another.",
      "ACTIVE_TIMER_EXISTS"
    );
  }
}

export function assertValidRange(
  startedAt: Date,
  endedAt: Date | null | undefined
): void {
  if (!isValidEntryRange(startedAt, endedAt)) {
    throw new EntryRuleError(
      "endedAt must be after startedAt",
      "INVALID_RANGE"
    );
  }
}

export function assertHasActiveTimer(activeCount: number): void {
  if (activeCount === 0) {
    throw new EntryRuleError("No active timer to stop", "NO_ACTIVE_TIMER");
  }
}
