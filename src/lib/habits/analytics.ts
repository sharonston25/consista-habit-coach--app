import type { Habit, HabitRecords, HabitStatus } from "./types";
import { format, subDays, eachDayOfInterval, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from "date-fns";

export const dateKey = (d: Date) => format(d, "yyyy-MM-dd");

export function statusScore(s: HabitStatus | undefined): number {
  if (s === "done") return 1;
  if (s === "partial") return 0.5;
  return 0;
}

export function dayCompletion(habits: Habit[], records: HabitRecords, d: Date): number {
  if (habits.length === 0) return 0;
  const k = dateKey(d);
  const total = habits.reduce((acc, h) => acc + statusScore(records[h.id]?.[k]), 0);
  return total / habits.length;
}

export function streakForHabit(records: HabitRecords, habitId: string, today = new Date()): number {
  let streak = 0;
  let cursor = today;
  while (true) {
    const k = dateKey(cursor);
    const s = records[habitId]?.[k];
    if (s === "done" || s === "partial") {
      streak += 1;
      cursor = subDays(cursor, 1);
    } else {
      break;
    }
  }
  return streak;
}

export function weeklyStreak(habits: Habit[], records: HabitRecords, today = new Date()): number {
  // Days in a row where overall completion >= 50%
  let streak = 0;
  let cursor = today;
  while (true) {
    const c = dayCompletion(habits, records, cursor);
    if (c >= 0.5) {
      streak += 1;
      cursor = subDays(cursor, 1);
    } else break;
    if (streak > 365) break;
  }
  return streak;
}

export function last7Days(today = new Date()): Date[] {
  return eachDayOfInterval({ start: subDays(today, 6), end: today });
}

export function consistencyScore(habits: Habit[], records: HabitRecords, days = 30, today = new Date()): number {
  const range = eachDayOfInterval({ start: subDays(today, days - 1), end: today });
  const total = range.reduce((acc, d) => acc + dayCompletion(habits, records, d), 0);
  return Math.round((total / range.length) * 100);
}

export function strongestHabit(habits: Habit[], records: HabitRecords, days = 30, today = new Date()): Habit | null {
  if (habits.length === 0) return null;
  const range = eachDayOfInterval({ start: subDays(today, days - 1), end: today });
  let best: { h: Habit; score: number } | null = null;
  for (const h of habits) {
    const score = range.reduce((acc, d) => acc + statusScore(records[h.id]?.[dateKey(d)]), 0);
    if (!best || score > best.score) best = { h, score };
  }
  return best?.h ?? null;
}

export function weakestHabit(habits: Habit[], records: HabitRecords, days = 30, today = new Date()): Habit | null {
  if (habits.length === 0) return null;
  const range = eachDayOfInterval({ start: subDays(today, days - 1), end: today });
  let worst: { h: Habit; score: number } | null = null;
  for (const h of habits) {
    const score = range.reduce((acc, d) => acc + statusScore(records[h.id]?.[dateKey(d)]), 0);
    if (!worst || score < worst.score) worst = { h, score };
  }
  return worst?.h ?? null;
}

export function monthDays(date = new Date()): Date[] {
  return eachDayOfInterval({ start: startOfMonth(date), end: endOfMonth(date) });
}

export function yearDays(date = new Date()): Date[] {
  return eachDayOfInterval({ start: startOfYear(date), end: endOfYear(date) });
}

export function dailyIndex(seedKey: string, length: number, today = new Date()): number {
  // Stable per-day index based on day-of-year
  const start = startOfYear(today);
  const day = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  let h = 0;
  for (let i = 0; i < seedKey.length; i++) h = (h * 31 + seedKey.charCodeAt(i)) >>> 0;
  return (day + h) % length;
}

export function parseDateKey(k: string): Date {
  return parseISO(k);
}
