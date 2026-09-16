import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { handleZod, jsonError } from "@/lib/api";
import { assertValidRange, EntryRuleError } from "@/lib/entries";
import { durationMinutes } from "@/lib/time";

const patchSchema = z.object({
  projectId: z.string().min(1).optional(),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().nullable().optional(),
  note: z.string().max(500).nullable().optional(),
});

type Ctx = { params: { id: string } };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);
  const { id } = ctx.params;

  const existing = await prisma.timeEntry.findFirst({ where: { id, userId } });
  if (!existing) return jsonError("Not found", 404);

  try {
    const body = patchSchema.parse(await req.json());
    const startedAt = body.startedAt
      ? new Date(body.startedAt)
      : existing.startedAt;
    const endedAt =
      body.endedAt === undefined
        ? existing.endedAt
        : body.endedAt === null
          ? null
          : new Date(body.endedAt);

    assertValidRange(startedAt, endedAt);

    if (body.projectId) {
      const project = await prisma.project.findFirst({
        where: { id: body.projectId, userId },
      });
      if (!project) return jsonError("Project not found", 404);
    }

    const entry = await prisma.timeEntry.update({
      where: { id },
      data: {
        ...(body.projectId ? { projectId: body.projectId } : {}),
        ...(body.startedAt ? { startedAt } : {}),
        ...(body.endedAt !== undefined ? { endedAt } : {}),
        ...(body.note !== undefined ? { note: body.note } : {}),
      },
      include: { project: { select: { name: true, color: true } } },
    });

    return NextResponse.json({
      id: entry.id,
      projectId: entry.projectId,
      projectName: entry.project.name,
      projectColor: entry.project.color,
      startedAt: entry.startedAt.toISOString(),
      endedAt: entry.endedAt?.toISOString() ?? null,
      note: entry.note,
      durationMinutes: durationMinutes(entry.startedAt, entry.endedAt),
    });
  } catch (err) {
    if (err instanceof EntryRuleError) {
      return jsonError(err.message, 409);
    }
    return handleZod(err);
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);
  const { id } = ctx.params;

  const existing = await prisma.timeEntry.findFirst({ where: { id, userId } });
  if (!existing) return jsonError("Not found", 404);

  await prisma.timeEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
