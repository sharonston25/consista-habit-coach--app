import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format, isToday } from "date-fns";
import { ProgressRing } from "@/components/ProgressRing";
import { HabitCard } from "@/components/HabitCard";
import { useHabits, useRecords, useNotes, useProfile } from "@/lib/habits/store";
import {
  dateKey,
  dayCompletion,
  last7Days,
  streakForHabit,
  weeklyStreak,
  dailyIndex,
} from "@/lib/habits/analytics";
import { QUOTES, FUN_FACTS, STRESS_TIPS } from "@/lib/habits/seed";
import { useGreeting } from "@/hooks/use-theme";
import type { HabitColor } from "@/lib/habits/types";
import { Plus, X, Sparkles, Flame, Target, TrendingUp, NotebookPen, Heart, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

const HABIT_COLORS: { value: HabitColor; label: string }[] = [
  { value: "primary", label: "Sage" },
  { value: "water", label: "Blue" },
  { value: "exercise", label: "Coral" },
  { value: "study", label: "Lilac" },
  { value: "read", label: "Green" },
  { value: "sleep", label: "Indigo" },
  { value: "meditation", label: "Pink" },
  { value: "walk", label: "Lime" },
  { value: "coding", label: "Teal" },
];

const ICON_OPTIONS = ["✨", "💪", "🎯", "📝", "🎨", "🎵", "🍎", "☕", "🌱", "🧠", "💡", "🔥"];

function Dashboard() {
  const { habits, addHabit, removeHabit } = useHabits();
  const { records, cycleStatus } = useRecords();
  const { notes, setNote } = useNotes();
  const { profile } = useProfile();
  const greeting = useGreeting();
  const [showAdd, setShowAdd] = useState(false);

  const today = useMemo(() => new Date(), []);
  const todayKey = dateKey(today);
  const completion = Math.round(dayCompletion(habits, records, today) * 100);
  const wStreak = weeklyStreak(habits, records, today);
  const week = last7Days(today);

  const doneCount = habits.filter((h) => records[h.id]?.[todayKey] === "done").length;
  const partialCount = habits.filter((h) => records[h.id]?.[todayKey] === "partial").length;

  const quote = QUOTES[dailyIndex("quotes", QUOTES.length, today)];
  const fact = FUN_FACTS[dailyIndex("facts", FUN_FACTS.length, today)];
  const tip = STRESS_TIPS[dailyIndex("tips", STRESS_TIPS.length, today)];

  const noteText = notes[todayKey] ?? "";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">{format(today, "EEEE, MMMM d")}</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight">{greeting}</h1>
      </div>

      {/* Hero progress + stats */}
      <section className="rounded-3xl border border-border/60 bg-card/80 p-5 shadow-card">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
          <ProgressRing value={completion} size={140} sublabel="today" />
          <div className="grid w-full grid-cols-3 gap-2.5">
            <StatCard icon={Target} label="Done" value={doneCount} tone="primary" />
            <StatCard icon={Flame} label="Streak" value={wStreak} tone="warm" />
            <StatCard icon={TrendingUp} label="Partial" value={partialCount} tone="ocean" />
          </div>
        </div>

        {/* Week strip */}
        <div className="mt-6 grid grid-cols-7 gap-1.5">
          {week.map((d) => {
            const c = Math.round(dayCompletion(habits, records, d) * 100);
            const active = isToday(d);
            return (
              <div key={d.toISOString()} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {format(d, "EEE")}
                </span>
                <div
                  className={cn(
                    "flex h-10 w-full max-w-[44px] items-center justify-center rounded-xl text-sm font-semibold transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : c > 0
                        ? "bg-primary/10 text-primary"
                        : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  {format(d, "d")}
                </div>
                {c > 0 && !active ? (
                  <span className="h-1 w-1 rounded-full bg-primary" />
                ) : (
                  <span className="h-1 w-1" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Quote */}
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-[oklch(0.92_0.04_150_/_0.7)] to-[oklch(0.94_0.04_95_/_0.5)] p-5 shadow-soft dark:from-[oklch(0.28_0.04_150_/_0.6)] dark:to-[oklch(0.26_0.04_95_/_0.4)]"
      >
        <Sparkles className="absolute right-4 top-4 h-4 w-4 text-primary/60" />
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Quote of the day
        </p>
        <blockquote className="mt-2 text-base font-medium leading-snug text-foreground">
          "{quote.text}"
        </blockquote>
        <p className="mt-2 text-xs text-muted-foreground">— {quote.author}</p>
      </motion.section>

      {/* Quick links for gendered sections */}
      {profile?.gender === "female" && (
        <Link
          to="/period"
          className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/70 p-4 shadow-soft transition-all hover:border-[var(--period)]/40 hover:bg-card"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--period)]/15 text-[var(--period)]">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Cycle tracker</p>
              <p className="text-xs text-muted-foreground">Mark periods, log symptoms, see phase tips</p>
            </div>
          </div>
          <span className="text-muted-foreground">→</span>
        </Link>
      )}
      {profile?.gender === "male" && (
        <Link
          to="/wellness"
          className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/70 p-4 shadow-soft transition-all hover:border-primary/40 hover:bg-card"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Wellness log</p>
              <p className="text-xs text-muted-foreground">Sleep, training, hydration, energy</p>
            </div>
          </div>
          <span className="text-muted-foreground">→</span>
        </Link>
      )}

      {/* Habits list */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Today's habits</h2>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-105"
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

      {/* Daily journal */}
      <section className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-soft">
        <div className="mb-2 flex items-center gap-2">
          <NotebookPen className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Today's note</h3>
        </div>
        <textarea
          value={noteText}
          onChange={(e) => setNote(todayKey, e.target.value)}
          placeholder="How did today feel? Wins, struggles, gratitude…"
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-background/60 px-3 py-2 text-sm leading-relaxed outline-none ring-primary/20 focus:ring-4"
        />
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Saved automatically · {noteText.length} characters
        </p>
      </section>

      {/* Fact + tip */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-soft">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Fun fact</p>
          <p className="mt-2 text-sm leading-relaxed">{fact}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-soft">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Calm tip</p>
          <p className="mt-2 text-sm leading-relaxed">{tip}</p>
        </div>
      </section>

      <p className="pt-1 text-center text-xs text-muted-foreground">
        Tap a habit icon to cycle: <span className="font-semibold">empty → done → partial → missed</span>.
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Target;
  label: string;
  value: number;
  tone: "primary" | "warm" | "ocean";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    warm: "bg-[oklch(0.78_0.1_70_/_0.18)] text-[oklch(0.5_0.12_55)] dark:text-[oklch(0.8_0.12_70)]",
    ocean: "bg-[oklch(0.7_0.08_220_/_0.18)] text-[oklch(0.45_0.1_220)] dark:text-[oklch(0.78_0.09_220)]",
  };
  return (
    <div className={cn("rounded-2xl p-3 shadow-soft", tones[tone])}>
      <Icon className="mb-1 h-4 w-4 opacity-80" />
      <div className="text-2xl font-semibold leading-none">{value}</div>
      <div className="mt-1 text-[10px] font-medium uppercase tracking-wider opacity-80">{label}</div>
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
      className="mb-3 space-y-3 overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-soft"
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
        className="w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm outline-none ring-primary/20 focus:ring-4"
      />
      <div>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Icon</p>
        <div className="flex flex-wrap gap-1.5">
          {ICON_OPTIONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-all",
                icon === i ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
              )}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Color</p>
        <div className="flex flex-wrap gap-1.5">
          {HABIT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-transform",
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
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Reminder (optional)
        </p>
        <input
          type="time"
          value={reminder}
          onChange={(e) => setReminder(e.target.value)}
          className="rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/20"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:scale-[1.01]"
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
