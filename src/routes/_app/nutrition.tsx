import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Apple, Flame, Plus, X, Settings as SettingsIcon, Footprints } from "lucide-react";
import { toast } from "sonner";
import { useNutrition, useProfile } from "@/lib/habits/store";
import { dateKey } from "@/lib/habits/analytics";
import {
  bmi,
  bmiCategory,
  dailyCalories,
  macroSplit,
  stepsToKcal,
  QUICK_MEALS,
} from "@/lib/habits/health";
import { ProgressRing } from "@/components/ProgressRing";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/nutrition")({
  component: Nutrition,
});

function Nutrition() {
  const { profile, mounted } = useProfile();
  const { nutrition, addMeal, removeMeal, setSteps } = useNutrition();
  const today = useMemo(() => new Date(), []);
  const todayKey = dateKey(today);
  const log = nutrition[todayKey] ?? { date: todayKey, meals: [], steps: 0 };

  const [customName, setCustomName] = useState("");
  const [customKcal, setCustomKcal] = useState("");

  const profileReady = !!(profile?.heightCm && profile?.weightKg && profile?.age);
  const target = profile ? dailyCalories(profile) : null;
  const stepGoal = profile?.stepGoal ?? 10000;

  const eaten = log.meals.reduce((a, m) => a + m.kcal, 0);
  const burnedFromSteps = stepsToKcal(log.steps ?? 0);
  const remaining = target ? target + burnedFromSteps - eaten : null;
  const eatenPct = target ? Math.min(100, Math.round((eaten / target) * 100)) : 0;
  const stepPct = Math.min(100, Math.round(((log.steps ?? 0) / stepGoal) * 100));

  const bmiValue = profile ? bmi(profile) : null;
  const cat = bmiCategory(bmiValue);
  const macros = target ? macroSplit(target) : null;

  // 14-day chart
  const last14 = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(today, 13), end: today });
    return days.map((d) => {
      const k = dateKey(d);
      const l = nutrition[k];
      return {
        short: format(d, "d"),
        kcal: l?.meals.reduce((a, m) => a + m.kcal, 0) ?? 0,
        steps: l?.steps ?? 0,
      };
    });
  }, [nutrition, today]);

  const addCustom = () => {
    const k = parseInt(customKcal, 10);
    if (!customName.trim()) {
      toast.error("Add a meal name first.");
      return;
    }
    if (!Number.isFinite(k) || k <= 0) {
      toast.error("Add a calorie amount (kcal) for your meal.");
      return;
    }
    addMeal(todayKey, { name: customName.trim(), kcal: k });
    toast.success(`Logged ${customName.trim()} (${k} kcal)`);
    setCustomName("");
    setCustomKcal("");
  };

  const handleAddSteps = (inc: number) => {
    setSteps(todayKey, (log.steps ?? 0) + inc);
    toast.success(`+${inc.toLocaleString()} steps · ${stepsToKcal(inc)} kcal burned`);
  };

  if (!mounted) {
    return <div className="h-32 animate-pulse rounded-2xl bg-muted/40" />;
  }

  if (!profileReady) {
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Apple className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">Nutrition & Steps</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            We need a few details to compute your personalized calorie target & BMI.
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/70 p-6 text-center shadow-soft">
          <Apple className="mx-auto h-10 w-10 text-primary/60" />
          <p className="mt-3 font-semibold">Complete your health profile</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your age, height, weight & activity level in Settings.
          </p>
          <Link
            to="/settings"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:scale-[1.02]"
          >
            <SettingsIcon className="h-4 w-4" /> Open settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Apple className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Nutrition & Steps</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{format(today, "EEEE, MMMM d")}</p>
      </div>

      {/* Hero rings */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-card/80 p-5 shadow-card">
          <div className="flex items-center gap-4">
            <ProgressRing value={eatenPct} size={104} sublabel="kcal" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Calories
              </p>
              <p className="mt-1 text-2xl font-semibold leading-none">
                {eaten}
                <span className="text-base text-muted-foreground"> / {target}</span>
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {remaining !== null && remaining >= 0
                  ? `${remaining} kcal left`
                  : `${Math.abs(remaining ?? 0)} kcal over`}
              </p>
              {burnedFromSteps > 0 && (
                <p className="mt-0.5 text-[11px] text-primary">
                  +{burnedFromSteps} from steps
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card/80 p-5 shadow-card">
          <div className="flex items-center gap-4">
            <ProgressRing value={stepPct} size={104} sublabel="steps" />
            <div className="flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Steps
              </p>
              <p className="mt-1 text-2xl font-semibold leading-none">
                {(log.steps ?? 0).toLocaleString()}
                <span className="text-base text-muted-foreground">
                  {" "}
                  / {stepGoal.toLocaleString()}
                </span>
              </p>
              <div className="mt-2 flex gap-1">
                {[500, 1000, 2500].map((inc) => (
                  <button
                    key={inc}
                    onClick={() => handleAddSteps(inc)}
                    className="flex-1 rounded-lg border border-border bg-background/60 px-2 py-1 text-[11px] font-semibold hover:border-primary/40"
                  >
                    +{inc.toLocaleString()}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setSteps(todayKey, 0);
                  toast.message("Steps reset to 0");
                }}
                className="mt-1 text-[10px] text-muted-foreground hover:text-destructive"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BMI + Macros */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-soft">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Body Mass Index
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold">{bmiValue ?? "—"}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                cat.tone === "primary" && "bg-primary/15 text-primary",
                cat.tone === "ocean" && "bg-[oklch(0.7_0.08_220_/_0.18)] text-[oklch(0.45_0.1_220)] dark:text-[oklch(0.78_0.09_220)]",
                cat.tone === "warm" && "bg-warning/20 text-[oklch(0.45_0.1_70)] dark:text-[oklch(0.85_0.12_80)]",
                cat.tone === "destructive" && "bg-destructive/15 text-destructive",
              )}
            >
              {cat.label}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {profile?.heightCm} cm · {profile?.weightKg} kg
          </p>
          {/* BMI scale bar */}
          <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div className="absolute inset-y-0 left-0 w-[30%] bg-[oklch(0.7_0.08_220)]" />
            <div className="absolute inset-y-0 left-[30%] w-[30%] bg-primary" />
            <div className="absolute inset-y-0 left-[60%] w-[20%] bg-warning" />
            <div className="absolute inset-y-0 left-[80%] w-[20%] bg-destructive" />
            {bmiValue !== null && (
              <div
                className="absolute -top-0.5 h-3 w-1 rounded-full bg-foreground"
                style={{
                  left: `${Math.min(100, Math.max(0, ((bmiValue - 15) / 25) * 100))}%`,
                }}
              />
            )}
          </div>
        </div>

        {macros && (
          <div className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-soft">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Suggested macros
            </p>
            <div className="mt-3 space-y-2">
              <MacroBar label="Protein" g={macros.protein.g} kcal={macros.protein.kcal} pct={30} color="oklch(0.7 0.1 45)" />
              <MacroBar label="Carbs" g={macros.carbs.g} kcal={macros.carbs.kcal} pct={45} color="oklch(0.7 0.08 220)" />
              <MacroBar label="Fat" g={macros.fat.g} kcal={macros.fat.kcal} pct={25} color="oklch(0.78 0.1 70)" />
            </div>
          </div>
        )}
      </section>

      {/* Quick add meals */}
      <section className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <Flame className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Quick add</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_MEALS.map((m) => (
            <button
              key={m.name}
              onClick={() => {
                addMeal(todayKey, { name: m.name, kcal: m.kcal });
                toast.success(`${m.emoji} ${m.name} · +${m.kcal} kcal`);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-medium hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <span>{m.emoji}</span>
              <span>{m.name}</span>
              <span className="text-muted-foreground">{m.kcal}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Custom meal"
            className="flex-1 rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/20"
          />
          <input
            value={customKcal}
            onChange={(e) => setCustomKcal(e.target.value.replace(/\D/g, ""))}
            placeholder="kcal"
            inputMode="numeric"
            className="w-20 rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/20"
          />
          <button
            onClick={addCustom}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft"
            aria-label="Add custom meal"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Today's meals */}
      <section className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-soft">
        <p className="mb-2 text-sm font-semibold">Today's meals ({log.meals.length})</p>
        {log.meals.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No meals logged yet — tap a quick add above.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {log.meals.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2">
                <span className="text-sm">{m.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{m.kcal} kcal</span>
                  <button
                    onClick={() => removeMeal(todayKey, m.id)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                    aria-label="Remove meal"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Charts */}
      <section className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-card">
        <p className="mb-3 text-sm font-semibold">Last 14 days</p>
        <MiniChart data={last14} dataKey="kcal" label="Calories" color="oklch(0.7 0.1 45)" />
        <MiniChart data={last14} dataKey="steps" label="Steps" color="oklch(0.6 0.08 150)" />
      </section>
    </div>
  );
}

function MacroBar({ label, g, kcal, pct, color }: { label: string; g: number; kcal: number; pct: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs font-medium">
          {label} <span className="text-muted-foreground">· {g}g</span>
        </span>
        <span className="text-[11px] text-muted-foreground">{kcal} kcal</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
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
  data: Array<{ short: string; [k: string]: string | number }>;
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


