import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { handleZod, jsonError } from "@/lib/api";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  color: z.string().max(32).nullable().optional(),
});

export async function GET(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const includeArchived =
    req.nextUrl.searchParams.get("includeArchived") === "true";

  const projects = await prisma.project.findMany({
    where: {
      userId,
      ...(includeArchived ? {} : { archived: false }),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  try {
    const body = createSchema.parse(await req.json());
    const project = await prisma.project.create({
      data: {
        name: body.name,
        color: body.color ?? null,
        userId,
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    return handleZod(err);
  }
}
