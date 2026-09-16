import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { handleZod, jsonError } from "@/lib/api";
import { assertValidRange, EntryRuleError } from "@/lib/entries";
import { durationMinutes } from "@/lib/time";

const createSchema = z.object({
  projectId: z.string().min(1),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
  note: z.string().max(500).nullable().optional(),
});

export async function GET(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const sp = req.nextUrl.searchParams;
  const projectId = sp.get("projectId") || undefined;
  const from = sp.get("from");
  const to = sp.get("to");

  const startedAtFilter: { gte?: Date; lte?: Date } = {};
  if (from) startedAtFilter.gte = new Date(from);
  if (to) startedAtFilter.lte = new Date(to);

  const entries = await prisma.timeEntry.findMany({
    where: {
      userId,
      ...(projectId ? { projectId } : {}),
      ...(from || to ? { startedAt: startedAtFilter } : {}),
    },
    include: { project: { select: { name: true, color: true } } },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json(
    entries.map((e) => ({
      id: e.id,
      projectId: e.projectId,
      projectName: e.project.name,
      projectColor: e.project.color,
      startedAt: e.startedAt.toISOString(),
      endedAt: e.endedAt?.toISOString() ?? null,
      note: e.note,
      durationMinutes: durationMinutes(e.startedAt, e.endedAt),
    }))
  );
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  try {
    const body = createSchema.parse(await req.json());
    const startedAt = new Date(body.startedAt);
    const endedAt = new Date(body.endedAt);
    assertValidRange(startedAt, endedAt);

    const project = await prisma.project.findFirst({
      where: { id: body.projectId, userId, archived: false },
    });
    if (!project) return jsonError("Project not found or archived", 404);

    const entry = await prisma.timeEntry.create({
      data: {
        userId,
        projectId: body.projectId,
        startedAt,
        endedAt,
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
        endedAt: entry.endedAt?.toISOString() ?? null,
        note: entry.note,
        durationMinutes: durationMinutes(entry.startedAt, entry.endedAt),
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
