import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { useSettings, useProfile, useHabits, resetAll } from "@/lib/habits/store";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, Lock, User, Trash2, Bell, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/settings")({
  component: Settings,
});

function Settings() {
  const { profile, setProfile } = useProfile();
  const { settings, setSettings } = useSettings();
  const { habits, updateHabit } = useHabits();
  const { theme, toggle } = useTheme();
  const [name, setName] = useState(profile?.name ?? "");
  const [savedName, setSavedName] = useState(false);
  const [pinDraft, setPinDraft] = useState("");
  const [pinError, setPinError] = useState("");
  const navigate = useNavigate();

  const saveName = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({ name: name.trim() || "Friend", createdAt: profile?.createdAt ?? new Date().toISOString() });
    setSavedName(true);
    setTimeout(() => setSavedName(false), 1500);
  };

  const togglePin = () => {
    if (settings.pinEnabled) {
      setSettings({ ...settings, pinEnabled: false, pin: undefined });
      setPinDraft("");
      setPinError("");
    } else {
      // open inline form
      setSettings({ ...settings, pinEnabled: false }); // will require setting pin first
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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Profile, security, and app preferences.</p>
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
            className="flex-1 rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm outline-none ring-primary/30 focus:ring-4"
          />
          <button
            type="submit"
            className="rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:scale-[1.02]"
          >
            {savedName ? "✓ Saved" : "Save"}
          </button>
        </form>
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
                theme === "dark" ? "gradient-primary" : "bg-muted"
              )}
              aria-label="Toggle dark mode"
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                  "absolute top-1 h-5 w-5 rounded-full bg-white shadow-soft",
                  theme === "dark" ? "left-6" : "left-1"
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
                settings.pinEnabled ? "gradient-primary" : "bg-muted"
              )}
              aria-label="Toggle PIN"
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                  "absolute top-1 h-5 w-5 rounded-full bg-white shadow-soft",
                  settings.pinEnabled ? "left-6" : "left-1"
                )}
              />
            </button>
          }
        />
        {!settings.pinEnabled && (
          <div className="mt-3 flex flex-col gap-2 rounded-xl border border-dashed border-border p-3">
            <p className="text-xs text-muted-foreground">Set a 4-digit PIN to enable app lock.</p>
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
                className="rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:scale-[1.02]"
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
          {habits.length === 0 ? (
            <p className="text-sm text-muted-foreground">No habits yet.</p>
          ) : (
            habits.map((h) => (
              <div key={h.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-2.5">
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
          All your habit data lives on this device only. AI coach messages are sent to the AI service to generate replies, but they aren't tied to an account.
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
        Consista v1.0 · made with ♥ for daily progress
      </p>
    </div>
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
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary text-primary-foreground shadow-soft">
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
