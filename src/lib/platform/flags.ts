/**
 * Feature Flags
 * -------------
 * Typed registry for runtime-toggleable features. Defaults live in code; users
 * (or devs) can override per-flag via localStorage. Adding a new flag = add one
 * line to FLAG_DEFAULTS and reference it via `useFlag("yourKey")`.
 */
import { useEffect, useState } from "react";

export const FLAG_DEFAULTS = {
  // gamification
  achievements: true,
  milestoneCelebrations: true,
  streakFreezes: true,
  // health
  waterTracker: true,
  sleepLogger: true,
  weightHistory: true,
  // intelligence
  weeklyAiReview: true,
  plateScanner: true,
  // engagement
  onboardingTour: true,
  pushNotifications: false, // opt-in
  // experiments
  widgetRegistry: true,
  pwaInstallPrompt: false,
  familyShare: false,
  studentsHub: false,
  mensHub: false,
} as const;

export type FlagKey = keyof typeof FLAG_DEFAULTS;

const LS_KEY = "consista:flags:v1";

type Overrides = Partial<Record<FlagKey, boolean>>;

function readOverrides(): Overrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Overrides) : {};
  } catch {
    return {};
  }
}

function writeOverrides(o: Overrides) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(o));
  listeners.forEach((l) => l());
}

const listeners = new Set<() => void>();

export function getFlag(key: FlagKey): boolean {
  const overrides = readOverrides();
  return overrides[key] ?? FLAG_DEFAULTS[key];
}

export function setFlag(key: FlagKey, value: boolean | null) {
  const o = readOverrides();
  if (value === null) delete o[key];
  else o[key] = value;
  writeOverrides(o);
}

export function getAllFlags(): Record<FlagKey, boolean> {
  const o = readOverrides();
  const out = {} as Record<FlagKey, boolean>;
  (Object.keys(FLAG_DEFAULTS) as FlagKey[]).forEach((k) => {
    out[k] = o[k] ?? FLAG_DEFAULTS[k];
  });
  return out;
}

export function useFlag(key: FlagKey): boolean {
  const [value, setValue] = useState<boolean>(() => FLAG_DEFAULTS[key]);
  useEffect(() => {
    setValue(getFlag(key));
    const fn = () => setValue(getFlag(key));
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, [key]);
  return value;
}

export function useAllFlags() {
  const [flags, setFlags] = useState<Record<FlagKey, boolean>>(() => ({ ...FLAG_DEFAULTS }));
  useEffect(() => {
    setFlags(getAllFlags());
    const fn = () => setFlags(getAllFlags());
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return flags;
}
