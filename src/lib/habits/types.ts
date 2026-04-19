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
  icon: string;
  color: HabitColor;
  reminder?: string;
  createdAt: string;
}

export type HabitRecords = Record<string, Record<string, HabitStatus>>;

// notes[YYYY-MM-DD] = "free text"
export type DailyNotes = Record<string, string>;

export type Gender = "female" | "male" | "other";

export interface UserProfile {
  name: string;
  gender?: Gender;
  createdAt: string;
}

export interface AppSettings {
  theme: "light" | "dark";
  pinEnabled: boolean;
  pin?: string;
  hasOnboarded: boolean;
}

export type CycleFlow = "light" | "medium" | "heavy";
export type CycleSymptom = "cramps" | "headache" | "bloating" | "fatigue" | "mood" | "acne" | "tender";
export type CycleMood = "great" | "good" | "okay" | "low" | "rough";

export interface CycleEntry {
  date: string; // YYYY-MM-DD
  isPeriod: boolean;
  flow?: CycleFlow;
  symptoms?: CycleSymptom[];
  mood?: CycleMood;
  note?: string;
}

// keyed by date
export type CycleRecords = Record<string, CycleEntry>;

export interface WellnessLog {
  date: string; // YYYY-MM-DD
  energy?: number; // 1-5
  sleepHours?: number;
  workoutMinutes?: number;
  waterCups?: number;
  mood?: CycleMood;
  note?: string;
}

export type WellnessRecords = Record<string, WellnessLog>;
