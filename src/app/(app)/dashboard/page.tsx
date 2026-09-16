import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getTodayBounds,
  getWeekBounds,
  sumDurationMinutes,
  durationMinutes,
} from "@/lib/time";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const userId = await requireUserId();
  if (!userId) redirect("/login");

  const today = getTodayBounds();
  const week = getWeekBounds();

  const [todayEntries, weekEntries, projects, active, recent] =
    await Promise.all([
      prisma.timeEntry.findMany({
        where: {
          userId,
          endedAt: { not: null },
          startedAt: { gte: today.start, lte: today.end },
        },
      }),
      prisma.timeEntry.findMany({
        where: {
          userId,
          endedAt: { not: null },
          startedAt: { gte: week.start, lte: week.end },
        },
      }),
      prisma.project.findMany({
        where: { userId, archived: false },
        orderBy: { name: "asc" },
      }),
      prisma.timeEntry.findFirst({
        where: { userId, endedAt: null },
        include: { project: { select: { name: true, color: true } } },
      }),
      prisma.timeEntry.findMany({
        where: { userId },
        include: { project: { select: { name: true, color: true } } },
        orderBy: { startedAt: "desc" },
        take: 20,
      }),
    ]);

  const activeDto = active
    ? {
        id: active.id,
        projectId: active.projectId,
        projectName: active.project.name,
        startedAt: active.startedAt.toISOString(),
      }
    : null;

  const recentDto = recent.map((e) => ({
    id: e.id,
    projectName: e.project.name,
    projectColor: e.project.color,
    startedAt: e.startedAt.toISOString(),
    endedAt: e.endedAt?.toISOString() ?? null,
    note: e.note,
    durationMinutes: durationMinutes(e.startedAt, e.endedAt),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Today and week totals (completed entries only). Running timer shown
          separately.
        </p>
      </div>
      <StatsCards
        todayMinutes={sumDurationMinutes(todayEntries)}
        weekMinutes={sumDurationMinutes(weekEntries)}
      />
      <DashboardClient
        projects={projects.map((p) => ({
          id: p.id,
          name: p.name,
          color: p.color,
        }))}
        initialActive={activeDto}
        initialEntries={recentDto}
      />
    </div>
  );
}
