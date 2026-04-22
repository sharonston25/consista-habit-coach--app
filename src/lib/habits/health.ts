import type { ActivityLevel, Goal, UserProfile, Role } from "./types";

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

const GOAL_DELTA: Record<Goal, number> = {
  lose: -400,
  maintain: 0,
  gain: 350,
};

export function bmi(profile: Pick<UserProfile, "heightCm" | "weightKg">): number | null {
  if (!profile.heightCm || !profile.weightKg) return null;
  const m = profile.heightCm / 100;
  return +(profile.weightKg / (m * m)).toFixed(1);
}

export function bmiCategory(value: number | null): {
  label: string;
  tone: "ocean" | "primary" | "warm" | "destructive";
} {
  if (value === null) return { label: "—", tone: "primary" };
  if (value < 18.5) return { label: "Underweight", tone: "ocean" };
  if (value < 25) return { label: "Healthy", tone: "primary" };
  if (value < 30) return { label: "Overweight", tone: "warm" };
  return { label: "Obese", tone: "destructive" };
}

/** Mifflin-St Jeor BMR */
export function bmr(profile: UserProfile): number | null {
  const { weightKg, heightCm, age, gender } = profile;
  if (!weightKg || !heightCm || !age) return null;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === "female" ? base - 161 : base + 5);
}

export function dailyCalories(profile: UserProfile): number | null {
  const b = bmr(profile);
  if (b === null) return null;
  const factor = ACTIVITY_FACTOR[profile.activity ?? "moderate"];
  const goal = GOAL_DELTA[profile.goal ?? "maintain"];
  return Math.round(b * factor + goal);
}

export function macroSplit(kcal: number): {
  protein: { g: number; kcal: number };
  carbs: { g: number; kcal: number };
  fat: { g: number; kcal: number };
} {
  const proteinKcal = Math.round(kcal * 0.3);
  const carbsKcal = Math.round(kcal * 0.45);
  const fatKcal = kcal - proteinKcal - carbsKcal;
  return {
    protein: { kcal: proteinKcal, g: Math.round(proteinKcal / 4) },
    carbs: { kcal: carbsKcal, g: Math.round(carbsKcal / 4) },
    fat: { kcal: fatKcal, g: Math.round(fatKcal / 9) },
  };
}

/**
 * Recommended daily protein in grams.
 * Goal-based: maintain ~1.6 g/kg, lose 1.8 g/kg (preserves muscle in deficit), gain 2.0 g/kg.
 */
export function proteinTargetGrams(profile: UserProfile): number | null {
  if (!profile.weightKg) return null;
  const perKg = profile.goal === "lose" ? 1.8 : profile.goal === "gain" ? 2.0 : 1.6;
  return Math.round(profile.weightKg * perKg);
}

/**
 * Estimate weeks to reach a target weight given the user's goal calorie delta.
 * 7700 kcal ≈ 1 kg of body fat. Returns null if no target/no current weight.
 */
export function weeksToTarget(
  currentKg: number | undefined,
  targetKg: number | undefined,
  goal: Goal | undefined,
): { weeks: number; kgPerWeek: number; deltaKg: number } | null {
  if (!currentKg || !targetKg || currentKg === targetKg) return null;
  const deltaKg = +(targetKg - currentKg).toFixed(1);
  const dailyDelta = goal === "lose" ? -400 : goal === "gain" ? 350 : 0;
  if (dailyDelta === 0) return { weeks: 0, kgPerWeek: 0, deltaKg };
  const kcalPerWeek = Math.abs(dailyDelta) * 7;
  const kgPerWeek = +(kcalPerWeek / 7700).toFixed(2);
  const weeks = Math.max(1, Math.ceil(Math.abs(deltaKg) / kgPerWeek));
  return { weeks, kgPerWeek, deltaKg };
}

export const STEP_KCAL_PER_STEP = 0.04; // ~40kcal per 1000 steps for a ~70kg adult

export function stepsToKcal(steps: number): number {
  return Math.round(steps * STEP_KCAL_PER_STEP);
}

export const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; sub: string }[] = [
  { value: "sedentary", label: "Sedentary", sub: "Desk job, little exercise" },
  { value: "light", label: "Light", sub: "1-3 days/week" },
  { value: "moderate", label: "Moderate", sub: "3-5 days/week" },
  { value: "active", label: "Active", sub: "6-7 days/week" },
  { value: "athlete", label: "Athlete", sub: "2x/day training" },
];

export const GOAL_OPTIONS: { value: Goal; label: string; sub: string }[] = [
  { value: "lose", label: "Lose", sub: "−400 kcal/day" },
  { value: "maintain", label: "Maintain", sub: "Stay steady" },
  { value: "gain", label: "Gain", sub: "+350 kcal/day" },
];

export const ROLE_OPTIONS: { value: Role; label: string; emoji: string }[] = [
  { value: "woman", label: "Woman", emoji: "🌸" },
  { value: "man", label: "Man", emoji: "💪" },
  { value: "student", label: "Student", emoji: "🎓" },
  { value: "general", label: "General", emoji: "✨" },
];

export const QUICK_MEALS: { name: string; kcal: number; emoji: string }[] = [
  { name: "Coffee", kcal: 5, emoji: "☕" },
  { name: "Banana", kcal: 105, emoji: "🍌" },
  { name: "Apple", kcal: 95, emoji: "🍎" },
  { name: "Eggs (2)", kcal: 155, emoji: "🥚" },
  { name: "Oatmeal bowl", kcal: 280, emoji: "🥣" },
  { name: "Salad", kcal: 320, emoji: "🥗" },
  { name: "Sandwich", kcal: 380, emoji: "🥪" },
  { name: "Rice + chicken", kcal: 520, emoji: "🍚" },
  { name: "Pasta plate", kcal: 600, emoji: "🍝" },
  { name: "Pizza slice", kcal: 285, emoji: "🍕" },
  { name: "Burger", kcal: 540, emoji: "🍔" },
  { name: "Smoothie", kcal: 220, emoji: "🥤" },
  { name: "Protein shake", kcal: 180, emoji: "🥛" },
  { name: "Nuts handful", kcal: 170, emoji: "🥜" },
  { name: "Chocolate bar", kcal: 250, emoji: "🍫" },
];

export function roleTip(role: Role | undefined, hour: number): string {
  const r = role ?? "general";
  if (r === "woman") {
    if (hour < 11) return "Iron-rich breakfast helps energy through the day — try eggs + spinach.";
    if (hour < 17) return "5-min strength break: 10 squats + 10 push-ups boosts focus & bone health.";
    return "Magnesium-rich snack (dark chocolate, pumpkin seeds) supports sleep & cycle comfort.";
  }
  if (r === "man") {
    if (hour < 11) return "Protein-loaded breakfast (~30g) sets recovery and satiety for the day.";
    if (hour < 17) return "10-min walk after lunch cuts post-meal glucose by ~30%.";
    return "Cap caffeine 8h before bed — cortisol & sleep quality both improve.";
  }
  if (r === "student") {
    if (hour < 11) return "Pomodoro: 25 min focus, 5 min break. Hardest task first.";
    if (hour < 17) return "Active recall > re-reading. Close the book and write what you remember.";
    return "Stop screens 30 min before sleep — memory consolidation depends on it.";
  }
  if (hour < 11) return "Win the morning: hydrate, sunlight, then your first habit.";
  if (hour < 17) return "Move every hour — 60 seconds of stretching resets your posture.";
  return "Wind down: dim lights, no scrolling, plan tomorrow's first habit.";
}
