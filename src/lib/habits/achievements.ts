import type { Achievement, AchievementsState, Habit, HabitRecords, NutritionRecords, WellnessRecords } from "./types";
import { consistencyScore, weeklyStreak, dayCompletion, dateKey } from "./analytics";
import { eachDayOfInterval, subDays } from "date-fns";

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-step", emoji: "🌱", title: "First Step", description: "Complete one habit today.", category: "habits" },
  { id: "perfect-day", emoji: "✨", title: "Perfect Day", description: "Hit 100% completion for a day.", category: "habits" },
  { id: "streak-3", emoji: "🔥", title: "On Fire", description: "Reach a 3-day streak.", category: "streak" },
  { id: "streak-7", emoji: "⚡", title: "One Week Strong", description: "Reach a 7-day streak.", category: "streak" },
  { id: "streak-30", emoji: "💎", title: "Diamond Mind", description: "Reach a 30-day streak.", category: "streak" },
  { id: "streak-100", emoji: "👑", title: "Centurion", description: "Reach a 100-day streak.", category: "streak" },
  { id: "consistency-50", emoji: "📈", title: "Building", description: "Hit 50% 30-day consistency.", category: "milestone" },
  { id: "consistency-80", emoji: "🏆", title: "Locked In", description: "Hit 80% 30-day consistency.", category: "milestone" },
  { id: "nutrition-week", emoji: "🥗", title: "Mindful Eater", description: "Log meals 7 days in a row.", category: "nutrition" },
  { id: "steps-10k", emoji: "👟", title: "10K Club", description: "Hit 10,000 steps in one day.", category: "nutrition" },
  { id: "hydrated", emoji: "💧", title: "Hydrated", description: "Log 8+ cups of water in a day.", category: "wellness" },
  { id: "rested", emoji: "😴", title: "Well Rested", description: "Log 8+ hours of sleep.", category: "wellness" },
];

interface Inputs {
  habits: Habit[];
  records: HabitRecords;
  nutrition: NutritionRecords;
  wellness: WellnessRecords;
  state: AchievementsState;
  today?: Date;
}

/** Returns ids of newly unlocked achievements (not yet in state.unlocked). */
export function evaluateAchievements({
  habits,
  records,
  nutrition,
  wellness,
  state,
  today = new Date(),
}: Inputs): string[] {
  const newly: string[] = [];
  const has = (id: string) => !!state.unlocked[id];
  const todayKey = dateKey(today);

  // first-step
  if (!has("first-step")) {
    const anyDone = habits.some((h) => records[h.id]?.[todayKey] === "done");
    if (anyDone) newly.push("first-step");
  }
  // perfect-day
  if (!has("perfect-day") && habits.length > 0) {
    if (dayCompletion(habits, records, today) >= 1) newly.push("perfect-day");
  }
  // streaks
  const streak = weeklyStreak(habits, records, today);
  if (!has("streak-3") && streak >= 3) newly.push("streak-3");
  if (!has("streak-7") && streak >= 7) newly.push("streak-7");
  if (!has("streak-30") && streak >= 30) newly.push("streak-30");
  if (!has("streak-100") && streak >= 100) newly.push("streak-100");
  // consistency
  const c = consistencyScore(habits, records, 30, today);
  if (!has("consistency-50") && c >= 50) newly.push("consistency-50");
  if (!has("consistency-80") && c >= 80) newly.push("consistency-80");
  // nutrition-week
  if (!has("nutrition-week")) {
    const last7 = eachDayOfInterval({ start: subDays(today, 6), end: today });
    const allLogged = last7.every((d) => (nutrition[dateKey(d)]?.meals.length ?? 0) > 0);
    if (allLogged) newly.push("nutrition-week");
  }
  // steps-10k
  if (!has("steps-10k")) {
    const anyDay = Object.values(nutrition).some((n) => (n.steps ?? 0) >= 10000);
    if (anyDay) newly.push("steps-10k");
  }
  // hydrated
  if (!has("hydrated")) {
    const ok = Object.values(wellness).some((w) => (w.waterCups ?? 0) >= 8);
    if (ok) newly.push("hydrated");
  }
  // rested
  if (!has("rested")) {
    const ok = Object.values(wellness).some((w) => (w.sleepHours ?? 0) >= 8);
    if (ok) newly.push("rested");
  }

  return newly;
}

export function findAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365];

export function nextMilestone(streak: number): number | null {
  return STREAK_MILESTONES.find((m) => m > streak) ?? null;
}
