import { useEffect, useState, useCallback, useMemo } from "react";
import type {
  Habit,
  HabitRecords,
  HabitStatus,
  UserProfile,
  AppSettings,
  DailyNotes,
  CycleRecords,
  CycleEntry,
  WellnessRecords,
  WellnessLog,
  NutritionRecords,
  MealEntry,
  WeightHistory,
  AchievementsState,
} from "./types";
import { PREDEFINED_HABITS } from "./seed";

const KEYS = {
  habits: "consista:habits:v1",
  records: "consista:records:v1",
  profile: "consista:profile:v1",
  settings: "consista:settings:v1",
  visited: "consista:visited:v1",
  notes: "consista:notes:v1",
  cycle: "consista:cycle:v1",
  wellness: "consista:wellness:v1",
  nutrition: "consista:nutrition:v1",
  weight: "consista:weight:v1",
  achievements: "consista:achievements:v1",
};

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/**
 * Mount-aware store sync.
 * Returns `mounted` flag — components SHOULD render skeleton/empty until mounted
 * to avoid SSR hydration mismatches (since real values come from localStorage).
 */
function useStoreSync() {
  const [mounted, setMounted] = useState(false);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    setMounted(true);
    const unsub = subscribe(() => setVersion((t) => t + 1));
    return () => {
      unsub();
    };
  }, []);
  return { mounted, version };
}

// ----- Habits -----
export function getHabits(): Habit[] {
  return readLS<Habit[]>(KEYS.habits, PREDEFINED_HABITS);
}
export function setHabits(h: Habit[]) {
  writeLS(KEYS.habits, h);
  emit();
}

// ----- Records -----
export function getRecords(): HabitRecords {
  return readLS<HabitRecords>(KEYS.records, {});
}
export function setRecords(r: HabitRecords) {
  writeLS(KEYS.records, r);
  emit();
}

// ----- Profile -----
export function getProfile(): UserProfile | null {
  return readLS<UserProfile | null>(KEYS.profile, null);
}
export function setProfile(p: UserProfile | null) {
  writeLS(KEYS.profile, p);
  emit();
}

// ----- Settings -----
export function getSettings(): AppSettings {
  return readLS<AppSettings>(KEYS.settings, {
    theme: "light",
    pinEnabled: false,
    hasOnboarded: false,
  });
}
export function setSettings(s: AppSettings) {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", s.theme === "dark");
  }
  writeLS(KEYS.settings, s);
  emit();
}

// ----- Visited -----
export function hasVisited(): boolean {
  return readLS<boolean>(KEYS.visited, false);
}
export function markVisited() {
  writeLS(KEYS.visited, true);
}

// ----- Daily notes -----
export function getNotes(): DailyNotes {
  return readLS<DailyNotes>(KEYS.notes, {});
}
export function setNotes(n: DailyNotes) {
  writeLS(KEYS.notes, n);
  emit();
}

// ----- Cycle -----
export function getCycle(): CycleRecords {
  return readLS<CycleRecords>(KEYS.cycle, {});
}
export function setCycle(c: CycleRecords) {
  writeLS(KEYS.cycle, c);
  emit();
}

// ----- Wellness -----
export function getWellness(): WellnessRecords {
  return readLS<WellnessRecords>(KEYS.wellness, {});
}
export function setWellness(w: WellnessRecords) {
  writeLS(KEYS.wellness, w);
  emit();
}

// ----- Nutrition -----
export function getNutrition(): NutritionRecords {
  return readLS<NutritionRecords>(KEYS.nutrition, {});
}
export function setNutrition(n: NutritionRecords) {
  writeLS(KEYS.nutrition, n);
  emit();
}

export function resetAll() {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
  document.documentElement.classList.remove("dark");
  emit();
}

// ----- Hooks -----

export function useHabits() {
  const { mounted, version } = useStoreSync();
  const habits = useMemo(() => (mounted ? getHabits() : []), [mounted, version]);
  const update = useCallback((h: Habit[]) => setHabits(h), []);
  const addHabit = useCallback((h: Omit<Habit, "id" | "createdAt">) => {
    const next: Habit = { ...h, id: `h-${Date.now()}`, createdAt: new Date().toISOString() };
    setHabits([...getHabits(), next]);
  }, []);
  const removeHabit = useCallback((id: string) => {
    setHabits(getHabits().filter((h) => h.id !== id));
    const recs = getRecords();
    delete recs[id];
    setRecords(recs);
  }, []);
  const updateHabit = useCallback((id: string, patch: Partial<Habit>) => {
    setHabits(getHabits().map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }, []);
  return { habits, mounted, setHabits: update, addHabit, removeHabit, updateHabit };
}

export function useRecords() {
  const { mounted, version } = useStoreSync();
  const records = useMemo(() => (mounted ? getRecords() : {}), [mounted, version]);
  const setStatus = useCallback((habitId: string, dateKey: string, status: HabitStatus) => {
    const r = getRecords();
    if (!r[habitId]) r[habitId] = {};
    if (status === "empty") delete r[habitId][dateKey];
    else r[habitId][dateKey] = status;
    setRecords(r);
  }, []);
  const cycleStatus = useCallback((habitId: string, dateKey: string) => {
    const r = getRecords();
    const cur = r[habitId]?.[dateKey];
    const next: HabitStatus =
      cur === undefined ? "done" : cur === "done" ? "partial" : cur === "partial" ? "missed" : "empty";
    if (!r[habitId]) r[habitId] = {};
    if (next === "empty") delete r[habitId][dateKey];
    else r[habitId][dateKey] = next;
    setRecords(r);
  }, []);
  return { records, mounted, setStatus, cycleStatus };
}

export function useProfile() {
  const { mounted, version } = useStoreSync();
  const profile = useMemo(() => (mounted ? getProfile() : null), [mounted, version]);
  return { profile, mounted, setProfile };
}

export function useSettings() {
  const { mounted, version } = useStoreSync();
  const fallback: AppSettings = { theme: "light", pinEnabled: false, hasOnboarded: false, pin: undefined };
  const settings = useMemo(() => (mounted ? getSettings() : fallback), [mounted, version]);
  return {
    settings,
    mounted,
    setSettings,
  };
}

export function useNotes() {
  const { mounted, version } = useStoreSync();
  const notes = useMemo(() => (mounted ? getNotes() : {}), [mounted, version]);
  const setNote = useCallback((dateKey: string, text: string) => {
    const n = getNotes();
    const trimmed = text.trim();
    if (!trimmed) delete n[dateKey];
    else n[dateKey] = trimmed;
    setNotes(n);
  }, []);
  return { notes, mounted, setNote };
}

export function useCycle() {
  const { mounted, version } = useStoreSync();
  const cycle = useMemo(() => (mounted ? getCycle() : {}), [mounted, version]);
  const upsertCycle = useCallback((dateKey: string, patch: Partial<CycleEntry>) => {
    const c = getCycle();
    const existing = c[dateKey] ?? { date: dateKey, isPeriod: false };
    c[dateKey] = { ...existing, ...patch, date: dateKey };
    setCycle(c);
  }, []);
  const togglePeriod = useCallback((dateKey: string) => {
    const c = getCycle();
    const existing = c[dateKey];
    if (existing?.isPeriod) {
      if (!existing.symptoms?.length && !existing.mood && !existing.note && !existing.flow) {
        delete c[dateKey];
      } else {
        c[dateKey] = { ...existing, isPeriod: false, flow: undefined };
      }
    } else {
      c[dateKey] = {
        ...(existing ?? {}),
        date: dateKey,
        isPeriod: true,
        flow: existing?.flow ?? "medium",
      };
    }
    setCycle(c);
  }, []);
  const removeCycle = useCallback((dateKey: string) => {
    const c = getCycle();
    delete c[dateKey];
    setCycle(c);
  }, []);
  return { cycle, mounted, upsertCycle, togglePeriod, removeCycle };
}

export function useWellness() {
  const { mounted, version } = useStoreSync();
  const wellness = useMemo(() => (mounted ? getWellness() : {}), [mounted, version]);
  const upsertWellness = useCallback((dateKey: string, patch: Partial<WellnessLog>) => {
    const w = getWellness();
    const existing = w[dateKey] ?? { date: dateKey };
    w[dateKey] = { ...existing, ...patch, date: dateKey };
    setWellness(w);
  }, []);
  return { wellness, mounted, upsertWellness };
}

export function useNutrition() {
  const { mounted, version } = useStoreSync();
  const nutrition = useMemo(() => (mounted ? getNutrition() : {}), [mounted, version]);
  const addMeal = useCallback((dateKey: string, meal: Omit<MealEntry, "id">) => {
    const n = getNutrition();
    const existing = n[dateKey] ?? { date: dateKey, meals: [] };
    n[dateKey] = {
      ...existing,
      date: dateKey,
      meals: [...existing.meals, { ...meal, id: `m-${Date.now()}` }],
    };
    setNutrition(n);
  }, []);
  const removeMeal = useCallback((dateKey: string, mealId: string) => {
    const n = getNutrition();
    const existing = n[dateKey];
    if (!existing) return;
    n[dateKey] = { ...existing, meals: existing.meals.filter((m) => m.id !== mealId) };
    setNutrition(n);
  }, []);
  const setSteps = useCallback((dateKey: string, steps: number) => {
    const n = getNutrition();
    const existing = n[dateKey] ?? { date: dateKey, meals: [] };
    n[dateKey] = { ...existing, date: dateKey, steps: Math.max(0, Math.round(steps)) };
    setNutrition(n);
  }, []);
  return { nutrition, mounted, addMeal, removeMeal, setSteps };
}

// ----- Weight history -----
export function getWeights(): WeightHistory {
  return readLS<WeightHistory>(KEYS.weight, {});
}
export function setWeights(w: WeightHistory) {
  writeLS(KEYS.weight, w);
  emit();
}

export function useWeights() {
  const { mounted, version } = useStoreSync();
  const weights = useMemo(() => (mounted ? getWeights() : {}), [mounted, version]);
  const logWeight = useCallback((dateKey: string, kg: number) => {
    const w = getWeights();
    if (!Number.isFinite(kg) || kg <= 0) return;
    w[dateKey] = +kg.toFixed(1);
    setWeights(w);
  }, []);
  const removeWeight = useCallback((dateKey: string) => {
    const w = getWeights();
    delete w[dateKey];
    setWeights(w);
  }, []);
  return { weights, mounted, logWeight, removeWeight };
}

// ----- Achievements -----
const DEFAULT_ACHIEVEMENTS: AchievementsState = {
  unlocked: {},
  streakFreezes: 2, // start with 2 freezes
};

export function getAchievements(): AchievementsState {
  return readLS<AchievementsState>(KEYS.achievements, DEFAULT_ACHIEVEMENTS);
}
export function setAchievementsState(s: AchievementsState) {
  writeLS(KEYS.achievements, s);
  emit();
}

export function useAchievements() {
  const { mounted, version } = useStoreSync();
  const state = useMemo(
    () => (mounted ? getAchievements() : DEFAULT_ACHIEVEMENTS),
    [mounted, version],
  );
  const unlock = useCallback((id: string) => {
    const s = getAchievements();
    if (s.unlocked[id]) return false;
    s.unlocked[id] = new Date().toISOString();
    setAchievementsState(s);
    return true;
  }, []);
  const useFreeze = useCallback((dateKey: string) => {
    const s = getAchievements();
    if (s.streakFreezes <= 0) return false;
    s.streakFreezes -= 1;
    s.lastFreezeUsed = dateKey;
    setAchievementsState(s);
    return true;
  }, []);
  const grantFreeze = useCallback(() => {
    const s = getAchievements();
    s.streakFreezes = Math.min(5, s.streakFreezes + 1);
    setAchievementsState(s);
  }, []);
  const markMilestone = useCallback((streak: number) => {
    const s = getAchievements();
    if ((s.lastMilestoneCelebrated ?? 0) >= streak) return;
    s.lastMilestoneCelebrated = streak;
    setAchievementsState(s);
  }, []);
  return { state, mounted, unlock, useFreeze, grantFreeze, markMilestone };
}
