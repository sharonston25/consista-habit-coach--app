import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { format, getDay, startOfMonth, addMonths, subMonths } from "date-fns";
import { useHabits, useRecords } from "@/lib/habits/store";
import {
  consistencyScore,
  dayCompletion,
  monthDays,
  strongestHabit,
  weakestHabit,
  yearDays,
  dateKey,
} from "@/lib/habits/analytics";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/reports")({
  component: Reports,
});

function Reports() {
  const { habits } = useHabits();
  const { records } = useRecords();
  const [tab, setTab] = useState<"month" | "year">("month");
  const [monthCursor, setMonthCursor] = useState<Date>(startOfMonth(new Date()));

  const consistency = useMemo(() => consistencyScore(habits, records), [habits, records]);
  const yearConsistency = useMemo(() => consistencyScore(habits, records, 365), [habits, records]);
  const strongest = useMemo(() => strongestHabit(habits, records), [habits, records]);
  const weakest = useMemo(() => weakestHabit(habits, records), [habits, records]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your consistency at a glance.</p>
      </div>

      {/* Insight cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <InsightCard
          icon={Award}
          label="30-day consistency"
          value={`${consistency}%`}
          gradient="bg-gradient-to-br from-[oklch(0.55_0.22_270)] to-[oklch(0.65_0.21_330)]"
        />
        <InsightCard
          icon={TrendingUp}
          label="Strongest habit"
          value={strongest ? `${strongest.icon} ${strongest.name}` : "—"}
          gradient="bg-gradient-to-br from-[oklch(0.65_0.18_155)] to-[oklch(0.7_0.2_130)]"
        />
        <InsightCard
          icon={TrendingDown}
          label="Needs love"
          value={weakest ? `${weakest.icon} ${weakest.name}` : "—"}
          gradient="bg-gradient-to-br from-[oklch(0.7_0.21_35)] to-[oklch(0.65_0.22_350)]"
        />
      </div>

      <div className="inline-flex rounded-2xl border border-border/60 bg-card/60 p-1 shadow-soft">
        <button
          onClick={() => setTab("month")}
          className={cn(
            "rounded-xl px-4 py-1.5 text-sm font-semibold transition-all",
            tab === "month" ? "gradient-primary text-primary-foreground shadow-soft" : "text-muted-foreground"
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => setTab("year")}
          className={cn(
            "rounded-xl px-4 py-1.5 text-sm font-semibold transition-all",
            tab === "year" ? "gradient-primary text-primary-foreground shadow-soft" : "text-muted-foreground"
          )}
        >
          Yearly
        </button>
      </div>

      {tab === "month" ? (
        <MonthCalendar
          month={monthCursor}
          onPrev={() => setMonthCursor(subMonths(monthCursor, 1))}
          onNext={() => setMonthCursor(addMonths(monthCursor, 1))}
        />
      ) : (
        <YearHeatmap consistency={yearConsistency} />
      )}
    </div>
  );
}

function InsightCard({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: typeof Award;
  label: string;
  value: string;
  gradient: string;
}) {
  return (
    <div className={cn("rounded-2xl p-4 text-primary-foreground shadow-card", gradient)}>
      <Icon className="h-5 w-5 opacity-90" />
      <p className="mt-2 text-[10px] uppercase tracking-widest opacity-80">{label}</p>
      <p className="mt-1 truncate text-lg font-bold">{value}</p>
    </div>
  );
}

function MonthCalendar({ month, onPrev, onNext }: { month: Date; onPrev: () => void; onNext: () => void }) {
  const { habits } = useHabits();
  const { records } = useRecords();
  const days = monthDays(month);
  const startWeekday = getDay(startOfMonth(month)); // 0 = Sun
  const blanks = Array.from({ length: startWeekday }, (_, i) => i);

  return (
    <section className="rounded-3xl border border-border/60 bg-card/60 p-4 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onPrev} className="rounded-xl border border-border bg-background/60 p-2 hover:bg-muted">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-lg font-bold">{format(month, "MMMM yyyy")}</h3>
        <button onClick={onNext} className="rounded-xl border border-border bg-background/60 p-2 hover:bg-muted">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {blanks.map((b) => (
          <div key={`b-${b}`} />
        ))}
        {days.map((d) => {
          const c = dayCompletion(habits, records, d);
          const pct = Math.round(c * 100);
          return (
            <div
              key={d.toISOString()}
              className={cn(
                "relative aspect-square rounded-lg border border-border/40 p-1 text-[10px]",
                c >= 0.8 && "bg-success/30",
                c >= 0.5 && c < 0.8 && "bg-warning/30",
                c > 0 && c < 0.5 && "bg-destructive/15",
                c === 0 && "bg-muted/30"
              )}
              title={`${pct}%`}
            >
              <div className="font-semibold">{format(d, "d")}</div>
              {c > 0 && (
                <div className="absolute bottom-1 right-1 text-[9px] font-bold text-foreground/70">{pct}%</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
        <Legend color="bg-muted/30" label="0%" />
        <Legend color="bg-destructive/15" label="<50%" />
        <Legend color="bg-warning/30" label="50–80%" />
        <Legend color="bg-success/30" label="80%+" />
      </div>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("h-3 w-3 rounded border border-border/40", color)} />
      <span>{label}</span>
    </div>
  );
}

function YearHeatmap({ consistency }: { consistency: number }) {
  const { habits } = useHabits();
  const { records } = useRecords();
  const days = yearDays();

  // Group by week (column = week, row = day-of-week)
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = Array(7).fill(null);
  days.forEach((d, idx) => {
    const dow = getDay(d);
    currentWeek[dow] = d;
    if (dow === 6 || idx === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = Array(7).fill(null);
    }
  });

  return (
    <section className="rounded-3xl border border-border/60 bg-card/60 p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold">{new Date().getFullYear()} consistency</h3>
        <span className="rounded-full gradient-primary px-3 py-1 text-xs font-bold text-primary-foreground">
          {consistency}%
        </span>
      </div>
      <div className="overflow-x-auto no-scrollbar">
        <div className="inline-flex gap-[2px]">
          {weeks.map((w, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {w.map((d, di) => {
                if (!d) return <div key={di} className="h-2.5 w-2.5 rounded-[2px]" />;
                const c = dayCompletion(habits, records, d);
                return (
                  <div
                    key={di}
                    title={`${format(d, "MMM d")}: ${Math.round(c * 100)}%`}
                    className={cn(
                      "h-2.5 w-2.5 rounded-[2px] transition-all hover:scale-150",
                      c === 0 && "bg-muted/40",
                      c > 0 && c < 0.34 && "bg-primary/25",
                      c >= 0.34 && c < 0.67 && "bg-primary/55",
                      c >= 0.67 && c < 1 && "bg-primary/80",
                      c === 1 && "bg-primary shadow-glow"
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span>Less</span>
        <span className="h-2.5 w-2.5 rounded-[2px] bg-muted/40" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-primary/25" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-primary/55" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-primary/80" />
        <span className="h-2.5 w-2.5 rounded-[2px] bg-primary" />
        <span>More</span>
      </div>
    </section>
  );
}
