import { addDays, differenceInDays, parseISO, format } from "date-fns";
import type { CycleRecords } from "./types";

export const dKey = (d: Date) => format(d, "yyyy-MM-dd");

export interface CycleStats {
  lastPeriodStart: Date | null;
  averageCycleLength: number; // default 28 if unknown
  averagePeriodLength: number; // default 5 if unknown
  predictedNextStart: Date | null;
  predictedFertileWindow: { start: Date; end: Date } | null;
  predictedOvulation: Date | null;
  daysUntilNext: number | null;
  currentDayInCycle: number | null;
  currentPhase: "menstrual" | "follicular" | "ovulation" | "luteal" | "unknown";
}

/** Detect period start dates from sparse marks (a "start" is a period day with no period day immediately before). */
export function periodStarts(cycle: CycleRecords): Date[] {
  const days = Object.values(cycle)
    .filter((c) => c.isPeriod)
    .map((c) => parseISO(c.date))
    .sort((a, b) => a.getTime() - b.getTime());
  const starts: Date[] = [];
  for (const d of days) {
    const prev = addDays(d, -1);
    const prevKey = dKey(prev);
    if (!cycle[prevKey]?.isPeriod) starts.push(d);
  }
  return starts;
}

export function periodLengths(cycle: CycleRecords): number[] {
  const days = Object.values(cycle)
    .filter((c) => c.isPeriod)
    .map((c) => parseISO(c.date))
    .sort((a, b) => a.getTime() - b.getTime());
  if (days.length === 0) return [];
  const lengths: number[] = [];
  let runStart = days[0];
  let runLen = 1;
  for (let i = 1; i < days.length; i++) {
    if (differenceInDays(days[i], days[i - 1]) === 1) {
      runLen += 1;
    } else {
      lengths.push(runLen);
      runStart = days[i];
      runLen = 1;
    }
  }
  lengths.push(runLen);
  return lengths;
}

export function cycleStats(cycle: CycleRecords, today = new Date()): CycleStats {
  const starts = periodStarts(cycle);
  const lengths = periodLengths(cycle);
  const lastPeriodStart = starts.length ? starts[starts.length - 1] : null;

  // Average cycle length from gaps between starts
  let averageCycleLength = 28;
  if (starts.length >= 2) {
    const gaps: number[] = [];
    for (let i = 1; i < starts.length; i++) {
      gaps.push(differenceInDays(starts[i], starts[i - 1]));
    }
    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    if (avg >= 18 && avg <= 45) averageCycleLength = Math.round(avg);
  }

  const averagePeriodLength = lengths.length
    ? Math.max(2, Math.min(10, Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)))
    : 5;

  let predictedNextStart: Date | null = null;
  let predictedOvulation: Date | null = null;
  let predictedFertileWindow: { start: Date; end: Date } | null = null;
  let daysUntilNext: number | null = null;
  let currentDayInCycle: number | null = null;
  let currentPhase: CycleStats["currentPhase"] = "unknown";

  if (lastPeriodStart) {
    predictedNextStart = addDays(lastPeriodStart, averageCycleLength);
    // ovulation ~14 days before next period
    predictedOvulation = addDays(predictedNextStart, -14);
    predictedFertileWindow = {
      start: addDays(predictedOvulation, -4),
      end: addDays(predictedOvulation, 1),
    };
    daysUntilNext = differenceInDays(predictedNextStart, today);
    currentDayInCycle = differenceInDays(today, lastPeriodStart) + 1;

    if (currentDayInCycle <= averagePeriodLength) currentPhase = "menstrual";
    else if (currentDayInCycle < averageCycleLength - 14 - 2) currentPhase = "follicular";
    else if (currentDayInCycle <= averageCycleLength - 14 + 1) currentPhase = "ovulation";
    else currentPhase = "luteal";
  }

  return {
    lastPeriodStart,
    averageCycleLength,
    averagePeriodLength,
    predictedNextStart,
    predictedFertileWindow,
    predictedOvulation,
    daysUntilNext,
    currentDayInCycle,
    currentPhase,
  };
}

export const PHASE_TIPS: Record<CycleStats["currentPhase"], { title: string; tip: string }> = {
  menstrual: {
    title: "Menstrual phase",
    tip: "Rest more, prioritize iron-rich foods, gentle stretching. Honor lower energy.",
  },
  follicular: {
    title: "Follicular phase",
    tip: "Energy rises — great time to start new projects and try harder workouts.",
  },
  ovulation: {
    title: "Ovulation phase",
    tip: "Peak energy and confidence. Social activities and high-intensity workouts feel great.",
  },
  luteal: {
    title: "Luteal phase",
    tip: "Slow down. Focus on magnesium, sleep, and steady-state movement. Be kind to yourself.",
  },
  unknown: {
    title: "Track your cycle",
    tip: "Mark a few period days on the calendar to unlock predictions and phase tips.",
  },
};
