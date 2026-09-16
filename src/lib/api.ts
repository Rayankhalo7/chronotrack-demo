import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function handleZod(err: unknown) {
  if (err instanceof ZodError) {
    return jsonError(
      err.issues.map((i) => i.message).join("; ") || "Validation failed",
      400
    );
  }
  throw err;
}
