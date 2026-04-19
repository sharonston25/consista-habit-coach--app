import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  addMonths,
  subMonths,
  getDay,
  isSameDay,
  isSameMonth,
  addDays,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Heart, Droplet, Sparkles } from "lucide-react";
import { useCycle } from "@/lib/habits/store";
import { dKey, cycleStats, PHASE_TIPS } from "@/lib/habits/cycle";
import { monthDays } from "@/lib/habits/analytics";
import type { CycleEntry, CycleSymptom, CycleFlow, CycleMood } from "@/lib/habits/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/period")({
  component: PeriodTracker,
});

const SYMPTOMS: { key: CycleSymptom; label: string; emoji: string }[] = [
  { key: "cramps", label: "Cramps", emoji: "🌀" },
  { key: "headache", label: "Headache", emoji: "🤕" },
  { key: "bloating", label: "Bloating", emoji: "🎈" },
  { key: "fatigue", label: "Fatigue", emoji: "😴" },
  { key: "mood", label: "Mood swings", emoji: "🌗" },
  { key: "acne", label: "Acne", emoji: "✨" },
  { key: "tender", label: "Tender", emoji: "💗" },
];

const FLOWS: { key: CycleFlow; label: string }[] = [
  { key: "light", label: "Light" },
  { key: "medium", label: "Medium" },
  { key: "heavy", label: "Heavy" },
];

const MOODS: { key: CycleMood; emoji: string; label: string }[] = [
  { key: "great", emoji: "😄", label: "Great" },
  { key: "good", emoji: "🙂", label: "Good" },
  { key: "okay", emoji: "😐", label: "Okay" },
  { key: "low", emoji: "😔", label: "Low" },
  { key: "rough", emoji: "😣", label: "Rough" },
];

function PeriodTracker() {
  const { cycle, upsertCycle, togglePeriod } = useCycle();
  const [monthCursor, setMonthCursor] = useState<Date>(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const stats = useMemo(() => cycleStats(cycle), [cycle]);
  const selectedKey = dKey(selectedDate);
  const selected: CycleEntry | undefined = cycle[selectedKey];

  const phase = PHASE_TIPS[stats.currentPhase];

  // Build predicted period set for next 90 days
  const predictedDays = useMemo(() => {
    const set = new Set<string>();
    if (stats.predictedNextStart) {
      for (let i = 0; i < stats.averagePeriodLength; i++) {
        set.add(dKey(addDays(stats.predictedNextStart, i)));
      }
      // also second cycle ahead
      const second = addDays(stats.predictedNextStart, stats.averageCycleLength);
      for (let i = 0; i < stats.averagePeriodLength; i++) {
        set.add(dKey(addDays(second, i)));
      }
    }
    return set;
  }, [stats]);

  const fertileDays = useMemo(() => {
    const set = new Set<string>();
    if (stats.predictedFertileWindow) {
      let cur = stats.predictedFertileWindow.start;
      while (cur <= stats.predictedFertileWindow.end) {
        set.add(dKey(cur));
        cur = addDays(cur, 1);
      }
    }
    return set;
  }, [stats]);

  const days = monthDays(monthCursor);
  const startWeekday = getDay(startOfMonth(monthCursor));
  const blanks = Array.from({ length: startWeekday }, (_, i) => i);

  const toggleSymptom = (s: CycleSymptom) => {
    const cur = selected?.symptoms ?? [];
    const next = cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s];
    upsertCycle(selectedKey, { symptoms: next });
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-[var(--period)]" />
          <h1 className="text-2xl font-semibold tracking-tight">Cycle</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap any day to mark your period. Predictions improve as you log.
        </p>
      </div>

      {/* Phase + predictions */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-[oklch(0.94_0.04_15_/_0.45)] to-[oklch(0.95_0.03_350_/_0.3)] p-4 shadow-soft dark:from-[oklch(0.28_0.06_15_/_0.4)] dark:to-[oklch(0.26_0.05_350_/_0.3)]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--period)]" />
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Current phase
            </p>
          </div>
          <p className="mt-2 text-base font-semibold">{phase.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{phase.tip}</p>
          {stats.currentDayInCycle && (
            <p className="mt-3 text-xs text-muted-foreground">
              Day <span className="font-semibold text-foreground">{stats.currentDayInCycle}</span> of{" "}
              ~{stats.averageCycleLength}
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-soft">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Next period
          </p>
          {stats.predictedNextStart ? (
            <>
              <p className="mt-2 text-base font-semibold">
                {format(stats.predictedNextStart, "EEE, MMM d")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {stats.daysUntilNext !== null && stats.daysUntilNext >= 0
                  ? `In ${stats.daysUntilNext} day${stats.daysUntilNext === 1 ? "" : "s"}`
                  : "Likely starting soon"}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Mark a few period days to see predictions.</p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <Stat label="Avg cycle" value={`${stats.averageCycleLength}d`} />
            <Stat label="Avg period" value={`${stats.averagePeriodLength}d`} />
          </div>
        </div>
      </section>

      {/* Calendar */}
      <section className="rounded-3xl border border-border/60 bg-card/80 p-4 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setMonthCursor(subMonths(monthCursor, 1))}
            className="rounded-xl border border-border bg-background/60 p-2 hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h3 className="text-base font-semibold">{format(monthCursor, "MMMM yyyy")}</h3>
          <button
            onClick={() => setMonthCursor(addMonths(monthCursor, 1))}
            className="rounded-xl border border-border bg-background/60 p-2 hover:bg-muted"
          >
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
            const k = dKey(d);
            const entry = cycle[k];
            const isPeriod = entry?.isPeriod;
            const isPredicted = !isPeriod && predictedDays.has(k);
            const isFertile = !isPeriod && !isPredicted && fertileDays.has(k);
            const isOvulation = stats.predictedOvulation && isSameDay(d, stats.predictedOvulation);
            const isSelected = isSameDay(d, selectedDate);
            const inMonth = isSameMonth(d, monthCursor);
            return (
              <button
                key={k}
                onClick={() => setSelectedDate(d)}
                className={cn(
                  "relative flex aspect-square flex-col items-center justify-center rounded-xl text-xs font-medium transition-all",
                  !inMonth && "opacity-30",
                  isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-card",
                  isPeriod
                    ? "bg-[var(--period)] text-[var(--period-foreground)] shadow-soft"
                    : isPredicted
                      ? "border-2 border-dashed border-[var(--period)]/60 bg-[var(--period)]/10 text-foreground"
                      : isFertile
                        ? "bg-[oklch(0.85_0.08_220_/_0.4)] text-foreground dark:bg-[oklch(0.4_0.08_220_/_0.5)]"
                        : isToday(d)
                          ? "bg-primary/15 text-primary"
                          : "bg-muted/30 text-foreground hover:bg-muted/60"
                )}
                title={isPeriod ? "Period" : isPredicted ? "Predicted period" : isFertile ? "Fertile" : ""}
              >
                <span>{format(d, "d")}</span>
                {isOvulation && (
                  <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[oklch(0.55_0.15_280)]" />
                )}
                {entry?.symptoms?.length ? (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-foreground/40" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[10px] text-muted-foreground">
          <Legend swatch="bg-[var(--period)]" label="Period" />
          <Legend swatch="border-2 border-dashed border-[var(--period)]/60 bg-[var(--period)]/10" label="Predicted" />
          <Legend swatch="bg-[oklch(0.85_0.08_220_/_0.6)] dark:bg-[oklch(0.4_0.08_220_/_0.6)]" label="Fertile window" />
        </div>
      </section>

      {/* Selected day editor */}
      <section className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Editing
            </p>
            <h3 className="text-base font-semibold">{format(selectedDate, "EEE, MMM d")}</h3>
          </div>
          <button
            onClick={() => togglePeriod(selectedKey)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shadow-soft transition-all",
              selected?.isPeriod
                ? "bg-[var(--period)] text-[var(--period-foreground)]"
                : "border border-[var(--period)]/40 bg-[var(--period)]/10 text-[var(--period)] hover:bg-[var(--period)]/20"
            )}
          >
            <Droplet className="h-3.5 w-3.5" />
            {selected?.isPeriod ? "Period day" : "Mark period"}
          </button>
        </div>

        {selected?.isPeriod && (
          <div className="mb-4">
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Flow</p>
            <div className="flex gap-1.5">
              {FLOWS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => upsertCycle(selectedKey, { flow: f.key })}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                    selected?.flow === f.key
                      ? "border-[var(--period)] bg-[var(--period)]/15 text-[var(--period)]"
                      : "border-border bg-background/60 text-muted-foreground hover:border-[var(--period)]/40"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Symptoms</p>
          <div className="flex flex-wrap gap-1.5">
            {SYMPTOMS.map((s) => {
              const active = selected?.symptoms?.includes(s.key);
              return (
                <button
                  key={s.key}
                  onClick={() => toggleSymptom(s.key)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                    active
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-background/60 text-muted-foreground hover:border-primary/40"
                  )}
                >
                  <span>{s.emoji}</span>
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Mood</p>
          <div className="flex gap-1.5">
            {MOODS.map((m) => (
              <button
                key={m.key}
                onClick={() => upsertCycle(selectedKey, { mood: m.key })}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-lg transition-all",
                  selected?.mood === m.key
                    ? "border-primary bg-primary/15"
                    : "border-border bg-background/60 hover:border-primary/40"
                )}
                aria-label={m.label}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Note</p>
          <textarea
            value={selected?.note ?? ""}
            onChange={(e) => upsertCycle(selectedKey, { note: e.target.value })}
            rows={2}
            placeholder="Anything you want to remember about today…"
            className="w-full resize-none rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none ring-primary/20 focus:ring-4"
          />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 px-2.5 py-2 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("h-3 w-3 rounded", swatch)} />
      <span>{label}</span>
    </div>
  );
}
