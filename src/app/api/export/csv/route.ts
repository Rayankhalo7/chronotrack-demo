import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { entriesToCsv } from "@/lib/csv";

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
      endedAt: { not: null },
      ...(projectId ? { projectId } : {}),
      ...(from || to ? { startedAt: startedAtFilter } : {}),
    },
    include: { project: { select: { name: true } } },
    orderBy: { startedAt: "asc" },
  });

  const csv = entriesToCsv(
    entries.map((e) => ({
      id: e.id,
      projectName: e.project.name,
      startedAt: e.startedAt,
      endedAt: e.endedAt,
      note: e.note,
    }))
  );

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="chronotrack-export.csv"',
    },
  });
}
