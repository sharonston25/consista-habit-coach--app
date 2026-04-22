import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Trophy, Flame, Snowflake, Sparkles } from "lucide-react";
import {
  useHabits,
  useRecords,
  useNutrition,
  useWellness,
  useAchievements,
} from "@/lib/habits/store";
import { weeklyStreak } from "@/lib/habits/analytics";
import {
  ACHIEVEMENTS,
  evaluateAchievements,
  nextMilestone,
} from "@/lib/habits/achievements";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/achievements")({
  component: Achievements,
});

function Achievements() {
  const { habits, mounted } = useHabits();
  const { records } = useRecords();
  const { nutrition } = useNutrition();
  const { wellness } = useWellness();
  const { state, unlock } = useAchievements();

  // Auto-evaluate on visit
  useEffect(() => {
    if (!mounted) return;
    const newly = evaluateAchievements({
      habits,
      records,
      nutrition,
      wellness,
      state,
    });
    newly.forEach(unlock);
  }, [mounted, habits, records, nutrition, wellness, state, unlock]);

  const today = useMemo(() => new Date(), []);
  const streak = weeklyStreak(habits, records, today);
  const next = nextMilestone(streak);
  const progressPct = next ? Math.round((streak / next) * 100) : 100;

  const unlockedCount = Object.keys(state.unlocked).length;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Achievements</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {unlockedCount} of {ACHIEVEMENTS.length} unlocked
        </p>
      </div>

      {/* Streak hero */}
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-5 shadow-card">
        <div className="flex items-center gap-4">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.78_0.13_45)] to-[oklch(0.65_0.18_25)] text-white shadow-glow">
            <Flame className="h-9 w-9 drop-shadow" />
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-card text-xs font-bold text-foreground">
              {streak}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Current streak
            </p>
            <p className="mt-0.5 text-2xl font-semibold">
              {streak} day{streak !== 1 ? "s" : ""}
            </p>
            {next && (
              <>
                <p className="mt-1 text-xs text-muted-foreground">
                  {next - streak} day{next - streak !== 1 ? "s" : ""} to next milestone
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-[oklch(0.78_0.13_45)] to-[oklch(0.65_0.18_25)]"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Streak freezes */}
      <section className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.7_0.08_220_/_0.18)] text-[oklch(0.45_0.1_220)] dark:text-[oklch(0.78_0.09_220)]">
            <Snowflake className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Streak freezes</p>
            <p className="text-xs text-muted-foreground">
              Auto-protects your streak on a missed day. You have{" "}
              <span className="font-semibold text-foreground">{state.streakFreezes}</span>{" "}
              available.
            </p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <Snowflake
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < state.streakFreezes ? "text-info" : "text-muted/40",
                )}
                fill={i < state.streakFreezes ? "currentColor" : "none"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Badges grid */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">Badges</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ACHIEVEMENTS.map((a) => {
            const unlockedAt = state.unlocked[a.id];
            const isUnlocked = !!unlockedAt;
            return (
              <motion.div
                key={a.id}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={cn(
                  "rounded-2xl border p-3 text-center shadow-soft transition-all",
                  isUnlocked
                    ? "border-primary/40 bg-gradient-to-br from-primary/5 to-accent/5"
                    : "border-border/60 bg-card/50 opacity-70 grayscale",
                )}
              >
                <div
                  className={cn(
                    "mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-2xl",
                    isUnlocked ? "bg-primary/10 shadow-glow" : "bg-muted/40",
                  )}
                >
                  {a.emoji}
                </div>
                <p className="mt-2 text-sm font-semibold leading-tight">{a.title}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                  {a.description}
                </p>
                {isUnlocked && (
                  <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                    {format(parseISO(unlockedAt), "MMM d")}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      <Link
        to="/dashboard"
        className="block rounded-xl border border-border/60 bg-card/60 p-3 text-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to Today
      </Link>
    </div>
  );
}
