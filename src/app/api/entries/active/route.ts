import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { handleZod, jsonError } from "@/lib/api";
import {
  assertCanStartTimer,
  assertHasActiveTimer,
  EntryRuleError,
} from "@/lib/entries";
import { durationMinutes } from "@/lib/time";

const startSchema = z.object({
  projectId: z.string().min(1),
  note: z.string().max(500).nullable().optional(),
});

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const entry = await prisma.timeEntry.findFirst({
    where: { userId, endedAt: null },
    include: { project: { select: { name: true, color: true } } },
  });

  if (!entry) return NextResponse.json(null);

  return NextResponse.json({
    id: entry.id,
    projectId: entry.projectId,
    projectName: entry.project.name,
    projectColor: entry.project.color,
    startedAt: entry.startedAt.toISOString(),
    endedAt: null,
    note: entry.note,
    durationMinutes: null,
  });
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  try {
    const body = startSchema.parse(await req.json());

    const activeCount = await prisma.timeEntry.count({
      where: { userId, endedAt: null },
    });
    assertCanStartTimer(activeCount);

    const project = await prisma.project.findFirst({
      where: { id: body.projectId, userId, archived: false },
    });
    if (!project) return jsonError("Project not found or archived", 404);

    const entry = await prisma.timeEntry.create({
      data: {
        userId,
        projectId: body.projectId,
        startedAt: new Date(),
        endedAt: null,
        note: body.note ?? null,
      },
      include: { project: { select: { name: true, color: true } } },
    });

    return NextResponse.json(
      {
        id: entry.id,
        projectId: entry.projectId,
        projectName: entry.project.name,
        projectColor: entry.project.color,
        startedAt: entry.startedAt.toISOString(),
        endedAt: null,
        note: entry.note,
        durationMinutes: null,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof EntryRuleError) {
      return jsonError(err.message, 409);
    }
    return handleZod(err);
  }
}

export async function PATCH() {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  try {
    const active = await prisma.timeEntry.findFirst({
      where: { userId, endedAt: null },
      include: { project: { select: { name: true, color: true } } },
    });
    assertHasActiveTimer(active ? 1 : 0);
    if (!active) return jsonError("No active timer", 409);

    const endedAt = new Date();
    const entry = await prisma.timeEntry.update({
      where: { id: active.id },
      data: { endedAt },
      include: { project: { select: { name: true, color: true } } },
    });

    return NextResponse.json({
      id: entry.id,
      projectId: entry.projectId,
      projectName: entry.project.name,
      projectColor: entry.project.color,
      startedAt: entry.startedAt.toISOString(),
      endedAt: entry.endedAt!.toISOString(),
      note: entry.note,
      durationMinutes: durationMinutes(entry.startedAt, entry.endedAt),
    });
  } catch (err) {
    if (err instanceof EntryRuleError) {
      return jsonError(err.message, 409);
    }
    throw err;
  }
}
