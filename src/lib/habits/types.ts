export type HabitStatus = "done" | "partial" | "missed" | "empty";

export type HabitColor =
  | "water"
  | "exercise"
  | "study"
  | "read"
  | "sleep"
  | "meditation"
  | "walk"
  | "coding"
  | "primary"
  | "accent";

export interface Habit {
  id: string;
  name: string;
  icon: string; // emoji
  color: HabitColor;
  reminder?: string; // "08:30"
  createdAt: string; // ISO date
}

// records[habitId][YYYY-MM-DD] = status
export type HabitRecords = Record<string, Record<string, HabitStatus>>;

export interface UserProfile {
  name: string;
  createdAt: string;
}

export interface AppSettings {
  theme: "light" | "dark";
  pinEnabled: boolean;
  pin?: string; // 4 digits
  hasOnboarded: boolean;
}
