import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { format, getDay, startOfMonth, addMonths, subMonths, subDays, eachDayOfInterval } from "date-fns";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useHabits, useRecords } from "@/lib/habits/store";
import {
  consistencyScore,
  dayCompletion,
  monthDays,
  strongestHabit,
  weakestHabit,
  yearDays,
  dateKey,
  statusScore,
} from "@/lib/habits/analytics";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Award } from "lucide-react";
import { WeeklyReviewCard } from "@/components/WeeklyReviewCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/reports")({
  component: Reports,
});

function Reports() {
  const { habits } = useHabits();
  const { records } = useRecords();
  const [tab, setTab] = useState<"week" | "month" | "year">("week");
  const [monthCursor, setMonthCursor] = useState<Date>(startOfMonth(new Date()));

  const consistency = useMemo(() => consistencyScore(habits, records), [habits, records]);
  const yearConsistency = useMemo(() => consistencyScore(habits, records, 365), [habits, records]);
  const strongest = useMemo(() => strongestHabit(habits, records), [habits, records]);
  const weakest = useMemo(() => weakestHabit(habits, records), [habits, records]);

  const last14 = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() });
    return days.map((d) => ({
      date: format(d, "d"),
      full: format(d, "MMM d"),
      completion: Math.round(dayCompletion(habits, records, d) * 100),
    }));
  }, [habits, records]);

  const habitTotals = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
    return habits.map((h) => {
      const score = days.reduce((acc, d) => acc + statusScore(records[h.id]?.[dateKey(d)]), 0);
      return {
        name: h.name.length > 10 ? h.name.slice(0, 10) + "…" : h.name,
        full: h.name,
        score: Math.round((score / days.length) * 100),
        icon: h.icon,
      };
    });
  }, [habits, records]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your consistency at a glance.</p>
      </div>

      {/* Insight cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <InsightCard icon={Award} label="30-day score" value={`${consistency}%`} tone="primary" />
        <InsightCard
          icon={TrendingUp}
          label="Strongest"
          value={strongest ? `${strongest.icon} ${strongest.name}` : "—"}
          tone="success"
        />
        <InsightCard
          icon={TrendingDown}
          label="Needs love"
          value={weakest ? `${weakest.icon} ${weakest.name}` : "—"}
          tone="warm"
        />
      </div>

      {/* AI weekly review */}
      <WeeklyReviewCard />

      <div className="inline-flex rounded-xl border border-border/60 bg-card/60 p-1 shadow-soft">
        {(["week", "month", "year"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition-all",
              tab === k ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground"
            )}
          >
            {k}
          </button>
        ))}
      </div>

      {tab === "week" && (
        <>
          <ChartCard title="Last 14 days — daily completion %">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last14} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    formatter={(v) => [`${v}%`, "Completion"]}
                    labelFormatter={(_l, p) => p?.[0]?.payload?.full ?? ""}
                    cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  />
                  <Bar dataKey="completion" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Habit performance — last 30 days">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={habitTotals}
                  layout="vertical"
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "var(--foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    formatter={(v) => [`${v}%`, "Score"]}
                    labelFormatter={(_l, p) => p?.[0]?.payload?.full ?? ""}
                    cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  />
                  <Bar dataKey="score" fill="var(--primary)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </>
      )}

      {tab === "month" && (
        <MonthCalendar
          month={monthCursor}
          onPrev={() => setMonthCursor(subMonths(monthCursor, 1))}
          onNext={() => setMonthCursor(addMonths(monthCursor, 1))}
        />
      )}

      {tab === "year" && <YearHeatmap consistency={yearConsistency} />}
    </div>
  );
}

function InsightCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Award;
  label: string;
  value: string;
  tone: "primary" | "success" | "warm";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-[oklch(0.62_0.12_150_/_0.15)] text-success",
    warm: "bg-[oklch(0.78_0.1_70_/_0.18)] text-[oklch(0.5_0.12_55)] dark:text-[oklch(0.8_0.12_70)]",
  };
  return (
    <div className={cn("rounded-2xl p-4 shadow-soft", tones[tone])}>
      <Icon className="h-4 w-4 opacity-80" />
      <p className="mt-2 text-[10px] font-medium uppercase tracking-widest opacity-80">{label}</p>
      <p className="mt-1 truncate text-base font-semibold">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border/60 bg-card/80 p-4 shadow-card">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function MonthCalendar({ month, onPrev, onNext }: { month: Date; onPrev: () => void; onNext: () => void }) {
  const { habits } = useHabits();
  const { records } = useRecords();
  const days = monthDays(month);
  const startWeekday = getDay(startOfMonth(month));
  const blanks = Array.from({ length: startWeekday }, (_, i) => i);

  return (
    <section className="rounded-3xl border border-border/60 bg-card/80 p-4 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onPrev} className="rounded-xl border border-border bg-background/60 p-2 hover:bg-muted">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-base font-semibold">{format(month, "MMMM yyyy")}</h3>
        <button onClick={onNext} className="rounded-xl border border-border bg-background/60 p-2 hover:bg-muted">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
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
                c >= 0.8 && "bg-success/25",
                c >= 0.5 && c < 0.8 && "bg-warning/25",
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
        <Legend color="bg-warning/25" label="50–80%" />
        <Legend color="bg-success/25" label="80%+" />
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
    <section className="rounded-3xl border border-border/60 bg-card/80 p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">{new Date().getFullYear()} consistency</h3>
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
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
