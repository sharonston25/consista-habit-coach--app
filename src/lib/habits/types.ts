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
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "athlete";
export type Goal = "lose" | "maintain" | "gain";
export type Role = "woman" | "man" | "student" | "general";

export interface UserProfile {
  name: string;
  gender?: Gender;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  activity?: ActivityLevel;
  goal?: Goal;
  role?: Role;
  stepGoal?: number; // default 10000
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
  date: string;
  isPeriod: boolean;
  flow?: CycleFlow;
  symptoms?: CycleSymptom[];
  mood?: CycleMood;
  note?: string;
}

export type CycleRecords = Record<string, CycleEntry>;

export interface WellnessLog {
  date: string;
  energy?: number;
  sleepHours?: number;
  workoutMinutes?: number;
  waterCups?: number;
  mood?: CycleMood;
  note?: string;
}

export type WellnessRecords = Record<string, WellnessLog>;

// Nutrition + steps
export interface MealEntry {
  id: string;
  name: string;
  kcal: number;
  time?: string; // HH:mm
}

export interface NutritionLog {
  date: string;
  meals: MealEntry[];
  steps?: number;
}

export type NutritionRecords = Record<string, NutritionLog>;
