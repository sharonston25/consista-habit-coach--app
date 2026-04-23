import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { Dumbbell, Moon, Zap, Heart } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { useWellness } from "@/lib/habits/store";
import { dateKey } from "@/lib/habits/analytics";
import { WaterTracker } from "@/components/WaterTracker";
import { SleepLogger } from "@/components/SleepLogger";
import type { CycleMood } from "@/lib/habits/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/wellness")({
  component: Wellness,
});

const TIPS = [
  "Aim for 7–9 hours of sleep tonight — recovery beats grinding.",
  "Drink a glass of water within 30 minutes of waking.",
  "Mobility before strength: 5 min of stretches prevents 50% of injuries.",
  "Eat protein within an hour after training to boost recovery.",
  "Box breathing 4-4-4-4 lowers cortisol in 90 seconds.",
  "Walk 10 minutes after a heavy meal — it cuts glucose spikes by 30%.",
  "Sunlight in the first hour of waking sets your circadian rhythm.",
  "Cold shower for 30 seconds at the end boosts alertness and mood.",
];

const MOODS: { key: CycleMood; emoji: string }[] = [
  { key: "great", emoji: "😤" },
  { key: "good", emoji: "🙂" },
  { key: "okay", emoji: "😐" },
  { key: "low", emoji: "😔" },
  { key: "rough", emoji: "😣" },
];

function Wellness() {
  const { wellness, upsertWellness } = useWellness();
  const today = useMemo(() => new Date(), []);
  const todayKey = dateKey(today);
  const log = wellness[todayKey] ?? { date: todayKey };
  const [tipIdx] = useState(() => Math.floor(Math.random() * TIPS.length));

  const last14 = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(today, 13), end: today });
    return days.map((d) => {
      const k = dateKey(d);
      const w = wellness[k];
      return {
        date: format(d, "MMM d"),
        short: format(d, "d"),
        sleep: w?.sleepHours ?? 0,
        workout: w?.workoutMinutes ?? 0,
        water: w?.waterCups ?? 0,
        energy: w?.energy ?? 0,
      };
    });
  }, [wellness, today]);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Wellness</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Quick daily log — sleep, training, hydration, energy.
        </p>
      </div>

      {/* Water + Sleep — featured trackers */}
      <section className="grid gap-3 sm:grid-cols-2">
        <WaterTracker
          cups={log.waterCups ?? 0}
          onChange={(v) => upsertWellness(todayKey, { waterCups: v })}
        />
        <SleepLogger
          hours={log.sleepHours}
          bedtime={log.bedtime}
          wakeTime={log.wakeTime}
          quality={log.sleepQuality}
          onChange={(patch) => upsertWellness(todayKey, patch)}
        />
      </section>

      {/* Quick numeric inputs */}
      <section className="grid gap-3 sm:grid-cols-2">
        <NumberCard
          icon={Dumbbell}
          label="Workout (min)"
          value={log.workoutMinutes}
          step={5}
          max={240}
          onChange={(v) => upsertWellness(todayKey, { workoutMinutes: v })}
          accent="bg-[oklch(0.7_0.1_45_/_0.18)] text-[oklch(0.5_0.12_45)] dark:text-[oklch(0.8_0.11_45)]"
        />
        <EnergyCard
          value={log.energy ?? 0}
          onChange={(v) => upsertWellness(todayKey, { energy: v })}
        />
      </section>

      {/* Mood */}
      <section className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-soft">
        <div className="mb-2 flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Mood today</p>
        </div>
        <div className="flex gap-1.5">
          {MOODS.map((m) => (
            <button
              key={m.key}
              onClick={() => {
                upsertWellness(todayKey, { mood: m.key });
                toast.success(`Mood logged: ${m.emoji}`);
              }}
              className={cn(
                "flex-1 rounded-lg border py-2 text-2xl transition-all",
                log.mood === m.key
                  ? "border-primary bg-primary/15 scale-105"
                  : "border-border bg-background/60 hover:border-primary/40"
              )}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </section>

      {/* Charts */}
      <section className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-card">
        <p className="mb-3 text-sm font-semibold">Last 14 days</p>
        <MiniChart data={last14} dataKey="sleep" label="Sleep (h)" color="oklch(0.6 0.08 255)" />
        <MiniChart data={last14} dataKey="workout" label="Workout (min)" color="oklch(0.7 0.1 45)" />
        <MiniChart data={last14} dataKey="water" label="Water (cups)" color="oklch(0.7 0.08 220)" />
      </section>

      {/* Note */}
      <section className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-soft">
        <p className="mb-2 text-sm font-semibold">Note</p>
        <textarea
          value={log.note ?? ""}
          onChange={(e) => upsertWellness(todayKey, { note: e.target.value })}
          rows={2}
          placeholder="How did training feel? Any soreness, wins…"
          className="w-full resize-none rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none ring-primary/20 focus:ring-4"
        />
      </section>

      {/* Tip */}
      <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-[oklch(0.92_0.04_150_/_0.5)] to-[oklch(0.94_0.04_220_/_0.4)] p-4 shadow-soft dark:from-[oklch(0.28_0.05_150_/_0.4)] dark:to-[oklch(0.26_0.05_220_/_0.3)]">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Wellness tip</p>
        <p className="mt-2 text-sm leading-relaxed">{TIPS[tipIdx]}</p>
      </section>
    </div>
  );
}

function NumberCard({
  icon: Icon,
  label,
  value,
  step,
  max,
  onChange,
  accent,
}: {
  icon: typeof Moon;
  label: string;
  value: number | undefined;
  step: number;
  max: number;
  onChange: (v: number) => void;
  accent: string;
}) {
  const v = value ?? 0;
  return (
    <div className={cn("rounded-2xl border border-border/60 p-4 shadow-soft", accent)}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-medium uppercase tracking-wider opacity-80">{label}</p>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <button
          onClick={() => onChange(Math.max(0, +(v - step).toFixed(1)))}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/70 text-lg font-semibold text-foreground hover:bg-background"
        >
          −
        </button>
        <span className="text-2xl font-semibold">{v}</span>
        <button
          onClick={() => onChange(Math.min(max, +(v + step).toFixed(1)))}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/70 text-lg font-semibold text-foreground hover:bg-background"
        >
          +
        </button>
      </div>
    </div>
  );
}

function EnergyCard({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-soft">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-warning" />
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Energy</p>
      </div>
      <div className="mt-2 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(value === n ? 0 : n)}
            className={cn(
              "flex-1 rounded-lg border py-2 text-sm font-semibold transition-all",
              value >= n
                ? "border-warning bg-warning/20 text-warning-foreground"
                : "border-border bg-background/60 text-muted-foreground"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function MiniChart({
  data,
  dataKey,
  label,
  color,
}: {
  data: Array<{ short: string; date: string; [k: string]: string | number }>;
  dataKey: string;
  label: string;
  color: string;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="short" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={30} />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 11,
                padding: "4px 8px",
              }}
              labelStyle={{ color: "var(--muted-foreground)", fontSize: 10 }}
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
            />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
