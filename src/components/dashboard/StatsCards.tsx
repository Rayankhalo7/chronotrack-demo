import { Card } from "@/components/ui/Card";
import { formatMinutes } from "@/lib/time";

export function StatsCards({
  todayMinutes,
  weekMinutes,
}: {
  todayMinutes: number;
  weekMinutes: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <p className="text-sm font-medium text-muted">Today</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums text-foreground">
          {formatMinutes(todayMinutes)}
        </p>
      </Card>
      <Card>
        <p className="text-sm font-medium text-muted">This week</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums text-foreground">
          {formatMinutes(weekMinutes)}
        </p>
      </Card>
    </div>
  );
}
