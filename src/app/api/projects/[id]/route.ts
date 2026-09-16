import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { handleZod, jsonError } from "@/lib/api";

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  color: z.string().max(32).nullable().optional(),
  archived: z.boolean().optional(),
});

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);
  const { id } = ctx.params;

  const project = await prisma.project.findFirst({
    where: { id, userId },
  });
  if (!project) return jsonError("Not found", 404);
  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);
  const { id } = ctx.params;

  const existing = await prisma.project.findFirst({ where: { id, userId } });
  if (!existing) return jsonError("Not found", 404);

  try {
    const body = patchSchema.parse(await req.json());
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.color !== undefined ? { color: body.color } : {}),
        ...(body.archived !== undefined ? { archived: body.archived } : {}),
      },
    });
    return NextResponse.json(project);
  } catch (err) {
    return handleZod(err);
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);
  const { id } = ctx.params;

  const existing = await prisma.project.findFirst({ where: { id, userId } });
  if (!existing) return jsonError("Not found", 404);

  const entryCount = await prisma.timeEntry.count({ where: { projectId: id } });
  if (entryCount > 0) {
    return jsonError(
      "Project has time entries. Soft-archive instead (PATCH archived=true).",
      409
    );
  }

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
