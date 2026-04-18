import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { useHabits, useRecords } from "@/lib/habits/store";
import { dateKey, last7Days, statusScore, streakForHabit } from "@/lib/habits/analytics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/weekly")({
  component: WeeklyView,
});

function statusColor(score: number) {
  if (score === 1) return "bg-success text-success-foreground";
  if (score === 0.5) return "bg-warning text-warning-foreground";
  if (score === -1) return "bg-destructive/20 text-destructive";
  return "bg-muted/40 text-muted-foreground";
}

function WeeklyView() {
  const { habits } = useHabits();
  const { records } = useRecords();
  const days = last7Days();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Weekly view</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Last 7 days, color-coded. <span className="text-success font-medium">Done</span>,{" "}
          <span className="text-warning font-medium">partial</span>, missed.
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border/60 bg-card/60 p-4 shadow-card">
        <table className="w-full min-w-[480px] border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="w-32 text-left text-xs uppercase tracking-wider text-muted-foreground"></th>
              {days.map((d) => (
                <th
                  key={d.toISOString()}
                  className="px-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  <div>{format(d, "EEE")}</div>
                  <div className="text-foreground">{format(d, "d")}</div>
                </th>
              ))}
              <th className="w-14 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                🔥
              </th>
            </tr>
          </thead>
          <tbody>
            {habits.map((h) => {
              const streak = streakForHabit(records, h.id);
              return (
                <tr key={h.id}>
                  <td className="pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{h.icon}</span>
                      <span className="truncate text-sm font-medium">{h.name}</span>
                    </div>
                  </td>
                  {days.map((d) => {
                    const k = dateKey(d);
                    const s = records[h.id]?.[k];
                    const score = s === "missed" ? -1 : statusScore(s);
                    return (
                      <td key={k} className="px-1 text-center">
                        <div
                          className={cn(
                            "mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold",
                            statusColor(score)
                          )}
                        >
                          {s === "done" ? "✓" : s === "partial" ? "~" : s === "missed" ? "✕" : ""}
                        </div>
                      </td>
                    );
                  })}
                  <td className="text-center text-sm font-semibold">{streak}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
