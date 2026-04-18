import { useEffect, useState, useCallback } from "react";
import type { Habit, HabitRecords, HabitStatus, UserProfile, AppSettings } from "./types";
import { PREDEFINED_HABITS } from "./seed";

const KEYS = {
  habits: "consista:habits:v1",
  records: "consista:records:v1",
  profile: "consista:profile:v1",
  settings: "consista:settings:v1",
  visited: "consista:visited:v1",
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

// Simple pub/sub so multiple components stay in sync
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
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);
}

// ----- Public API -----

export function getHabits(): Habit[] {
  return readLS<Habit[]>(KEYS.habits, PREDEFINED_HABITS);
}

export function setHabits(h: Habit[]) {
  writeLS(KEYS.habits, h);
  emit();
}

export function getRecords(): HabitRecords {
  return readLS<HabitRecords>(KEYS.records, {});
}

export function setRecords(r: HabitRecords) {
  writeLS(KEYS.records, r);
  emit();
}

export function getProfile(): UserProfile | null {
  return readLS<UserProfile | null>(KEYS.profile, null);
}

export function setProfile(p: UserProfile | null) {
  writeLS(KEYS.profile, p);
  emit();
}

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

export function hasVisited(): boolean {
  return readLS<boolean>(KEYS.visited, false);
}

export function markVisited() {
  writeLS(KEYS.visited, true);
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
    if (status === "empty") {
      delete r[habitId][dateKey];
    } else {
      r[habitId][dateKey] = status;
    }
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
