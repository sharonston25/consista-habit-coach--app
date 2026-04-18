import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format, isToday, isSameMonth } from "date-fns";
import { ProgressRing } from "@/components/ProgressRing";
import { HabitCard } from "@/components/HabitCard";
import { useHabits, useRecords } from "@/lib/habits/store";
import { dateKey, dayCompletion, last7Days, streakForHabit, weeklyStreak, dailyIndex } from "@/lib/habits/analytics";
import { QUOTES, FUN_FACTS, STRESS_TIPS } from "@/lib/habits/seed";
import { useGreeting } from "@/hooks/use-theme";
import type { HabitColor } from "@/lib/habits/types";
import { Plus, X, Sparkles, Flame, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

const HABIT_COLORS: { value: HabitColor; label: string }[] = [
  { value: "primary", label: "Purple" },
  { value: "water", label: "Blue" },
  { value: "exercise", label: "Orange" },
  { value: "study", label: "Violet" },
  { value: "read", label: "Green" },
  { value: "sleep", label: "Indigo" },
  { value: "meditation", label: "Pink" },
  { value: "walk", label: "Lime" },
  { value: "coding", label: "Cyan" },
];

const ICON_OPTIONS = ["✨", "💪", "🎯", "📝", "🎨", "🎵", "🍎", "☕", "🌱", "🧠", "💡", "🔥"];

function Dashboard() {
  const { habits, addHabit, removeHabit } = useHabits();
  const { records, cycleStatus } = useRecords();
  const greeting = useGreeting();
  const [showAdd, setShowAdd] = useState(false);

  const today = useMemo(() => new Date(), []);
  const todayKey = dateKey(today);
  const completion = Math.round(dayCompletion(habits, records, today) * 100);
  const wStreak = weeklyStreak(habits, records, today);
  const week = last7Days(today);

  const partialCount = habits.filter((h) => records[h.id]?.[todayKey] === "partial").length;
  const doneCount = habits.filter((h) => records[h.id]?.[todayKey] === "done").length;

  const quote = QUOTES[dailyIndex("quotes", QUOTES.length, today)];
  const fact = FUN_FACTS[dailyIndex("facts", FUN_FACTS.length, today)];
  const tip = STRESS_TIPS[dailyIndex("tips", STRESS_TIPS.length, today)];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{format(today, "EEEE, MMMM d")}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{greeting}</h1>
      </div>

      {/* Hero progress + stats */}
      <section className="rounded-3xl border border-border/60 bg-gradient-to-br from-card to-card/50 p-5 shadow-card">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
          <ProgressRing value={completion} size={150} sublabel="today" />
          <div className="grid w-full grid-cols-3 gap-3">
            <StatCard icon={Target} label="Done" value={doneCount} gradient="gradient-primary" />
            <StatCard icon={Flame} label="Streak" value={wStreak} gradient="bg-gradient-to-br from-[oklch(0.7_0.21_35)] to-[oklch(0.65_0.22_350)]" />
            <StatCard icon={TrendingUp} label="Partial" value={partialCount} gradient="bg-gradient-to-br from-[oklch(0.65_0.18_165)] to-[oklch(0.6_0.18_200)]" />
          </div>
        </div>

        {/* Week strip */}
        <div className="mt-6 grid grid-cols-7 gap-1.5">
          {week.map((d) => {
            const c = Math.round(dayCompletion(habits, records, d) * 100);
            const active = isToday(d);
            return (
              <div key={d.toISOString()} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {format(d, "EEE")}
                </span>
                <div
                  className={cn(
                    "flex h-10 w-full max-w-[44px] items-center justify-center rounded-xl text-sm font-semibold transition-all",
                    active
                      ? "gradient-primary text-primary-foreground shadow-glow"
                      : c > 0
                        ? "bg-primary/15 text-primary"
                        : "bg-muted/60 text-muted-foreground"
                  )}
                >
                  {format(d, "d")}
                </div>
                {c > 0 && !active && <span className="h-1 w-1 rounded-full bg-primary" />}
                {!c && !active && <span className="h-1 w-1" />}
              </div>
            );
          })}
        </div>
      </section>

      {/* Quote of the day */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-5 text-primary-foreground shadow-elegant"
        style={{ background: "var(--gradient-aurora)" }}
      >
        <Sparkles className="absolute right-4 top-4 h-5 w-5 opacity-50" />
        <p className="text-xs uppercase tracking-[0.2em] opacity-80">Quote of the day</p>
        <blockquote className="mt-2 text-lg font-medium leading-snug">"{quote.text}"</blockquote>
        <p className="mt-2 text-sm opacity-80">— {quote.author}</p>
      </motion.section>

      {/* Habits list */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Today's habits</h2>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="inline-flex items-center gap-1 rounded-full gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-105"
          >
            <Plus className="h-3.5 w-3.5" /> New habit
          </button>
        </div>

        <AnimatePresence>
          {showAdd && (
            <AddHabitForm
              onCancel={() => setShowAdd(false)}
              onSubmit={(h) => {
                addHabit(h);
                setShowAdd(false);
              }}
            />
          )}
        </AnimatePresence>

        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {habits.map((h) => (
              <HabitCard
                key={h.id}
                habit={h}
                status={records[h.id]?.[todayKey]}
                streak={streakForHabit(records, h.id, today)}
                onCycle={() => cycleStatus(h.id, todayKey)}
                onDelete={() => {
                  if (confirm(`Delete "${h.name}"? This removes all its history.`)) removeHabit(h.id);
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Fun fact + stress tip */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-[oklch(0.65_0.2_165_/_0.15)] to-[oklch(0.6_0.18_200_/_0.05)] p-4 shadow-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Fun fact</p>
          <p className="mt-2 text-sm font-medium leading-relaxed">{fact}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-[oklch(0.7_0.18_320_/_0.15)] to-[oklch(0.6_0.22_285_/_0.05)] p-4 shadow-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Stress relief tip</p>
          <p className="mt-2 text-sm font-medium leading-relaxed">{tip}</p>
        </div>
      </section>

      {/* Tracking footnote */}
      <p className="pt-2 text-center text-xs text-muted-foreground">
        Tap an icon to cycle: <span className="font-semibold">empty → done → partial → missed</span>.
        {!isSameMonth(today, today) ? "" : ""}
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: typeof Target;
  label: string;
  value: number;
  gradient: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl p-3 text-primary-foreground shadow-soft", gradient)}>
      <Icon className="mb-1 h-4 w-4 opacity-80" />
      <div className="text-2xl font-bold leading-none">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wider opacity-90">{label}</div>
    </div>
  );
}

function AddHabitForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (h: { name: string; icon: string; color: HabitColor; reminder?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✨");
  const [color, setColor] = useState<HabitColor>("primary");
  const [reminder, setReminder] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), icon, color, reminder: reminder || undefined });
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={submit}
      className="mb-3 space-y-3 overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-card"
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold">New habit</p>
        <button type="button" onClick={onCancel} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>
      <input
        autoFocus
        type="text"
        placeholder="e.g. Journal for 5 min"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm outline-none ring-primary/30 focus:ring-4"
      />
      <div>
        <p className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">Icon</p>
        <div className="flex flex-wrap gap-1.5">
          {ICON_OPTIONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-all",
                icon === i ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
              )}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">Color</p>
        <div className="flex flex-wrap gap-1.5">
          {HABIT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-transform",
                `bg-[var(--habit-${c.value})]`,
                color === c.value ? "scale-110 border-foreground" : "border-transparent"
              )}
              style={{
                backgroundColor:
                  c.value === "primary"
                    ? "var(--primary)"
                    : c.value === "accent"
                      ? "var(--accent)"
                      : `var(--habit-${c.value})`,
              }}
              aria-label={c.label}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">Reminder (optional)</p>
        <input
          type="time"
          value={reminder}
          onChange={(e) => setReminder(e.target.value)}
          className="rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/30"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 rounded-xl gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:scale-[1.01]"
        >
          Add habit
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
}
