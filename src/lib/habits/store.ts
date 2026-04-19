import { useEffect, useState, useCallback } from "react";
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

function useStoreSync() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsub = subscribe(() => setTick((t) => t + 1));
    return () => {
      unsub();
    };
  }, []);
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

export function resetAll() {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
  emit();
}

// ----- Hooks -----

export function useHabits() {
  useStoreSync();
  const habits = getHabits();
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
  return { habits, setHabits: update, addHabit, removeHabit, updateHabit };
}

export function useRecords() {
  useStoreSync();
  const records = getRecords();
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
  return { records, setStatus, cycleStatus };
}

export function useProfile() {
  useStoreSync();
  return { profile: getProfile(), setProfile };
}

export function useSettings() {
  useStoreSync();
  return { settings: getSettings(), setSettings };
}

export function useNotes() {
  useStoreSync();
  const notes = getNotes();
  const setNote = useCallback((dateKey: string, text: string) => {
    const n = getNotes();
    const trimmed = text.trim();
    if (!trimmed) delete n[dateKey];
    else n[dateKey] = trimmed;
    setNotes(n);
  }, []);
  return { notes, setNote };
}

export function useCycle() {
  useStoreSync();
  const cycle = getCycle();
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
  return { cycle, upsertCycle, togglePeriod, removeCycle };
}

export function useWellness() {
  useStoreSync();
  const wellness = getWellness();
  const upsertWellness = useCallback((dateKey: string, patch: Partial<WellnessLog>) => {
    const w = getWellness();
    const existing = w[dateKey] ?? { date: dateKey };
    w[dateKey] = { ...existing, ...patch, date: dateKey };
    setWellness(w);
  }, []);
  return { wellness, upsertWellness };
}
