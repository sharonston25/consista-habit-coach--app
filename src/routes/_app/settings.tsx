import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSettings, useProfile, useHabits, resetAll } from "@/lib/habits/store";
import { useTheme } from "@/hooks/use-theme";
import type { ActivityLevel, Gender, Goal, Role, UserProfile } from "@/lib/habits/types";
import {
  ACTIVITY_OPTIONS,
  GOAL_OPTIONS,
  ROLE_OPTIONS,
  bmi,
  bmiCategory,
  dailyCalories,
} from "@/lib/habits/health";
import {
  Moon,
  Sun,
  Lock,
  User,
  Trash2,
  Bell,
  ShieldCheck,
  Heart,
  Activity,
  Footprints,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/settings")({
  component: Settings,
});

function Settings() {
  const { profile, setProfile, mounted } = useProfile();
  const { settings, setSettings } = useSettings();
  const { habits, updateHabit } = useHabits();
  const { theme, toggle } = useTheme();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [stepGoal, setStepGoal] = useState("10000");
  const [savedName, setSavedName] = useState(false);
  const [pinDraft, setPinDraft] = useState("");
  const [pinError, setPinError] = useState("");
  const navigate = useNavigate();

  // Sync local form state from profile when it loads
  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setAge(profile.age?.toString() ?? "");
    setHeight(profile.heightCm?.toString() ?? "");
    setWeight(profile.weightKg?.toString() ?? "");
    setStepGoal((profile.stepGoal ?? 10000).toString());
  }, [profile]);

  const updateProfile = (patch: Partial<UserProfile>) => {
    setProfile({
      name: profile?.name ?? "Friend",
      createdAt: profile?.createdAt ?? new Date().toISOString(),
      ...profile,
      ...patch,
    });
  };

  const saveName = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name: name.trim() || "Friend" });
    setSavedName(true);
    setTimeout(() => setSavedName(false), 1500);
  };

  const saveHealth = () => {
    updateProfile({
      age: age ? parseInt(age, 10) : undefined,
      heightCm: height ? parseInt(height, 10) : undefined,
      weightKg: weight ? parseInt(weight, 10) : undefined,
      stepGoal: parseInt(stepGoal, 10) || 10000,
    });
  };

  const togglePin = () => {
    if (settings.pinEnabled) {
      setSettings({ ...settings, pinEnabled: false, pin: undefined });
      setPinDraft("");
      setPinError("");
    } else {
      setSettings({ ...settings, pinEnabled: false });
    }
  };

  const savePin = () => {
    if (!/^\d{4}$/.test(pinDraft)) {
      setPinError("PIN must be exactly 4 digits.");
      return;
    }
    setSettings({ ...settings, pinEnabled: true, pin: pinDraft });
    setPinDraft("");
    setPinError("");
  };

  const handleReset = () => {
    if (confirm("Erase all habits, history, and settings? This can't be undone.")) {
      resetAll();
      navigate({ to: "/" });
    }
  };

  const bmiPreview = bmi({
    heightCm: height ? parseInt(height, 10) : undefined,
    weightKg: weight ? parseInt(weight, 10) : undefined,
  });
  const cat = bmiCategory(bmiPreview);
  const calPreview = profile
    ? dailyCalories({
        ...profile,
        age: age ? parseInt(age, 10) : profile.age,
        heightCm: height ? parseInt(height, 10) : profile.heightCm,
        weightKg: weight ? parseInt(weight, 10) : profile.weightKg,
      })
    : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Profile, health, security, and app preferences.
        </p>
      </div>

      {/* Profile */}
      <Card icon={User} title="Profile">
        <form onSubmit={saveName} className="flex gap-2">
          <input
            type="text"
            value={name}
            maxLength={32}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="flex-1 rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm outline-none ring-primary/20 focus:ring-4"
          />
          <button
            type="submit"
            className="rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:scale-[1.02]"
          >
            {savedName ? "✓ Saved" : "Save"}
          </button>
        </form>
      </Card>

      {/* Personalization */}
      <Card icon={Heart} title="Personalization">
        <p className="mb-2 text-xs text-muted-foreground">
          Unlocks the Cycle tracker (woman) or Wellness log (man).
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(["female", "male", "other"] as Gender[]).map((g) => {
            const active = profile?.gender === g;
            return (
              <button
                key={g}
                onClick={() => updateProfile({ gender: g })}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-semibold capitalize transition-colors",
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-background/60 text-muted-foreground hover:border-primary/40",
                )}
              >
                {g === "female" ? "Woman" : g === "male" ? "Man" : "Other"}
              </button>
            );
          })}
        </div>

        <p className="mb-2 mt-4 text-xs text-muted-foreground">Tips tailored for…</p>
        <div className="grid grid-cols-4 gap-1.5">
          {ROLE_OPTIONS.map((r) => {
            const active = profile?.role === r.value;
            return (
              <button
                key={r.value}
                onClick={() => updateProfile({ role: r.value as Role })}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl border px-2 py-2 text-[11px] font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background/60 text-muted-foreground hover:border-primary/40",
                )}
              >
                <span className="text-base">{r.emoji}</span>
                {r.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Health profile */}
      <Card icon={Activity} title="Health profile">
        <p className="mb-3 text-xs text-muted-foreground">
          Used to compute your BMI and daily calorie target — never leaves this device.
        </p>
        <div className="grid grid-cols-3 gap-2">
          <NumField label="Age" value={age} onChange={setAge} suffix="yrs" />
          <NumField label="Height" value={height} onChange={setHeight} suffix="cm" />
          <NumField label="Weight" value={weight} onChange={setWeight} suffix="kg" />
        </div>

        <p className="mb-1.5 mt-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Activity level
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {ACTIVITY_OPTIONS.map((a) => {
            const active = profile?.activity === a.value;
            return (
              <button
                key={a.value}
                onClick={() => updateProfile({ activity: a.value as ActivityLevel })}
                className={cn(
                  "rounded-lg border px-2 py-2 text-[11px] font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-background/60 text-muted-foreground hover:border-primary/40",
                )}
                title={a.sub}
              >
                {a.label}
              </button>
            );
          })}
        </div>

        <p className="mb-1.5 mt-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Goal
        </p>
        <div className="grid grid-cols-3 gap-2">
          {GOAL_OPTIONS.map((g) => {
            const active = profile?.goal === g.value;
            return (
              <button
                key={g.value}
                onClick={() => updateProfile({ goal: g.value as Goal })}
                className={cn(
                  "flex flex-col items-start rounded-xl border px-3 py-2 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background/60 text-muted-foreground hover:border-primary/40",
                )}
              >
                <span className="text-sm font-semibold">{g.label}</span>
                <span className="text-[10px] opacity-80">{g.sub}</span>
              </button>
            );
          })}
        </div>

        {/* Live preview */}
        {bmiPreview !== null && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border/60 bg-background/40 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">BMI</p>
              <p className="mt-0.5 text-lg font-semibold">
                {bmiPreview}{" "}
                <span className="text-xs font-medium text-muted-foreground">{cat.label}</span>
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Daily calories
              </p>
              <p className="mt-0.5 text-lg font-semibold">
                {calPreview ?? "—"}{" "}
                <span className="text-xs font-medium text-muted-foreground">kcal</span>
              </p>
            </div>
          </div>
        )}

        <button
          onClick={saveHealth}
          className="mt-4 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:scale-[1.01]"
        >
          Save health profile
        </button>
      </Card>

      {/* Step goal */}
      <Card icon={Footprints} title="Daily step goal">
        <div className="flex gap-2">
          <input
            value={stepGoal}
            onChange={(e) => setStepGoal(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            className="flex-1 rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-primary/20"
          />
          <button
            onClick={() => updateProfile({ stepGoal: parseInt(stepGoal, 10) || 10000 })}
            className="rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:scale-[1.02]"
          >
            Save
          </button>
        </div>
        <div className="mt-2 flex gap-1.5">
          {[6000, 8000, 10000, 12000].map((v) => (
            <button
              key={v}
              onClick={() => {
                setStepGoal(v.toString());
                updateProfile({ stepGoal: v });
              }}
              className="flex-1 rounded-lg border border-border bg-background/60 px-2 py-1 text-[11px] font-medium hover:border-primary/40"
            >
              {v.toLocaleString()}
            </button>
          ))}
        </div>
      </Card>

      {/* Theme */}
      <Card icon={theme === "dark" ? Moon : Sun} title="Appearance">
        <Row
          label="Dark mode"
          description="Easier on the eyes at night."
          control={
            <button
              onClick={toggle}
              className={cn(
                "relative h-7 w-12 rounded-full transition-colors",
                theme === "dark" ? "bg-primary" : "bg-muted",
              )}
              aria-label="Toggle dark mode"
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                  "absolute top-1 h-5 w-5 rounded-full bg-white shadow-soft",
                  theme === "dark" ? "left-6" : "left-1",
                )}
              />
            </button>
          }
        />
      </Card>

      {/* PIN lock */}
      <Card icon={Lock} title="App lock">
        <Row
          label="Require PIN"
          description="A 4-digit code is asked on launch."
          control={
            <button
              onClick={togglePin}
              className={cn(
                "relative h-7 w-12 rounded-full transition-colors",
                settings.pinEnabled ? "bg-primary" : "bg-muted",
              )}
              aria-label="Toggle PIN"
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                  "absolute top-1 h-5 w-5 rounded-full bg-white shadow-soft",
                  settings.pinEnabled ? "left-6" : "left-1",
                )}
              />
            </button>
          }
        />
        {!settings.pinEnabled && (
          <div className="mt-3 flex flex-col gap-2 rounded-xl border border-dashed border-border p-3">
            <p className="text-xs text-muted-foreground">
              Set a 4-digit PIN to enable app lock.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinDraft}
                onChange={(e) => setPinDraft(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="w-24 rounded-xl border border-border bg-background/60 px-3 py-2 text-center text-lg tracking-[0.4em] outline-none focus:ring-4 focus:ring-primary/30"
              />
              <button
                onClick={savePin}
                className="rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:scale-[1.02]"
              >
                Set PIN
              </button>
            </div>
            {pinError && <p className="text-xs text-destructive">{pinError}</p>}
          </div>
        )}
      </Card>

      {/* Reminders per habit */}
      <Card icon={Bell} title="Habit reminders">
        <div className="space-y-2">
          {!mounted ? (
            <div className="h-12 animate-pulse rounded-xl bg-muted/40" />
          ) : habits.length === 0 ? (
            <p className="text-sm text-muted-foreground">No habits yet.</p>
          ) : (
            habits.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-2.5"
              >
                <span className="text-xl">{h.icon}</span>
                <span className="flex-1 truncate text-sm font-medium">{h.name}</span>
                <input
                  type="time"
                  value={h.reminder ?? ""}
                  onChange={(e) => updateHabit(h.id, { reminder: e.target.value || undefined })}
                  className="rounded-lg border border-border bg-background/60 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Privacy */}
      <Card icon={ShieldCheck} title="Privacy">
        <p className="text-sm text-muted-foreground">
          All your habit data lives on this device only. AI coach messages are sent to the AI service to
          generate replies, but they aren't tied to an account.
        </p>
      </Card>

      {/* Danger zone */}
      <Card icon={Trash2} title="Danger zone">
        <button
          onClick={handleReset}
          className="w-full rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20"
        >
          Reset all data
        </button>
      </Card>

      <p className="pb-4 text-center text-xs text-muted-foreground">
        Consista v1.1 · made with ♥ for daily progress
      </p>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
          placeholder="—"
          className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 pr-9 text-sm outline-none focus:ring-4 focus:ring-primary/20"
        />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
          {suffix}
        </span>
      </div>
    </label>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof User;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Row({
  label,
  description,
  control,
}: {
  label: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {control}
    </div>
  );
}
