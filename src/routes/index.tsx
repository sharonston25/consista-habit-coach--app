import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ConsistaLogo } from "@/components/ConsistaLogo";
import { SplashScreen } from "@/components/SplashScreen";
import { hasVisited, markVisited, useProfile } from "@/lib/habits/store";
import type { Gender, Role } from "@/lib/habits/types";
import { ROLE_OPTIONS } from "@/lib/habits/health";
import {
  ArrowRight,
  Sparkles,
  BarChart3,
  Bell,
  Shield,
  User2,
  UserRound,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const [showSplash, setShowSplash] = useState(true);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | undefined>(undefined);
  const [role, setRole] = useState<Role | undefined>(undefined);
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const { profile, setProfile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    const visited = hasVisited();
    const t = setTimeout(
      () => {
        setShowSplash(false);
        if (visited && profile) {
          navigate({ to: "/dashboard" });
        }
      },
      visited ? 350 : 900,
    );
    return () => clearTimeout(t);
  }, [navigate, profile]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setProfile({
      name: trimmed,
      gender,
      role: role ?? (gender === "female" ? "woman" : gender === "male" ? "man" : "general"),
      age: age ? parseInt(age, 10) : undefined,
      heightCm: height ? parseInt(height, 10) : undefined,
      weightKg: weight ? parseInt(weight, 10) : undefined,
      activity: "moderate",
      goal: "maintain",
      stepGoal: 10000,
      createdAt: new Date().toISOString(),
    });
    markVisited();
    navigate({ to: "/dashboard" });
  };

  if (showSplash) return <SplashScreen />;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_15%_10%,oklch(0.9_0.05_150_/_0.4),transparent_45%),radial-gradient(circle_at_85%_90%,oklch(0.9_0.05_95_/_0.35),transparent_45%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ConsistaLogo size={32} />
            <span className="text-lg font-semibold tracking-tight">Consista</span>
          </div>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip →
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-12 py-10 md:grid-cols-2 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Calm. Consistent. Yours.
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Build the habit.
              <br />
              <span className="gradient-text">Be the change.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Track habits, calories, steps, sleep & cycles. Personalised tips for women, men, and
              students. Everything stays on your device.
            </p>

            <form onSubmit={handleStart} className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="What's your name?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-card/70 px-4 py-3 text-base shadow-soft outline-none ring-primary/20 backdrop-blur transition-all focus:ring-4"
                maxLength={32}
              />

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  I am
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <GenderOption
                    icon={UserRound}
                    label="Woman"
                    sub="Cycle tracking"
                    active={gender === "female"}
                    onClick={() => {
                      setGender("female");
                      if (!role) setRole("woman");
                    }}
                  />
                  <GenderOption
                    icon={User2}
                    label="Man"
                    sub="Wellness logs"
                    active={gender === "male"}
                    onClick={() => {
                      setGender("male");
                      if (!role) setRole("man");
                    }}
                  />
                  <GenderOption
                    icon={Users}
                    label="Other"
                    sub="Just habits"
                    active={gender === "other"}
                    onClick={() => setGender("other")}
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tips for me
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {ROLE_OPTIONS.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={cn(
                        "flex flex-col items-center gap-0.5 rounded-xl border bg-card/60 px-2 py-2 text-[11px] font-medium transition-all",
                        role === r.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60 text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      <span className="text-base">{r.emoji}</span>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  For BMI & calorie target (optional)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <NumField label="Age" value={age} onChange={setAge} suffix="yrs" />
                  <NumField label="Height" value={height} onChange={setHeight} suffix="cm" />
                  <NumField label="Weight" value={weight} onChange={setWeight} suffix="kg" />
                </div>
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-elegant transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                Start tracking
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>

            <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
              {[
                { icon: BarChart3, text: "BMI & calories" },
                { icon: Sparkles, text: "AI coach + voice" },
                { icon: Bell, text: "Gentle reminders" },
                { icon: Shield, text: "Private & offline" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary" /> {text}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="relative"
          >
            <div className="relative mx-auto aspect-[9/16] w-full max-w-[300px] rounded-[2rem] border-[6px] border-foreground/10 bg-card shadow-elegant">
              <div className="absolute left-1/2 top-2 h-1 w-14 -translate-x-1/2 rounded-full bg-foreground/15" />
              <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] p-5">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Today
                </div>
                <div className="mt-1 text-lg font-semibold">73% complete</div>
                <div className="mt-4 flex justify-center">
                  <div className="relative">
                    <ConsistaLogo size={120} animated />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-semibold gradient-text">73%</span>
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                        today
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <MiniStat label="Calories" value="1,420" sub="of 2,100" />
                  <MiniStat label="Steps" value="6,820" sub="of 10k" />
                </div>
                <div className="mt-3 space-y-1.5">
                  {["💧 Water", "🚶 Walk", "📖 Read"].map((h, i) => (
                    <div
                      key={h}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-card/70 px-2.5 py-1.5 text-xs"
                    >
                      <span>{h}</span>
                      <span
                        className={
                          i < 2
                            ? "h-4 w-4 rounded-md bg-success text-center text-[10px] leading-4 text-success-foreground"
                            : "h-4 w-4 rounded-md border-2 border-dashed border-border"
                        }
                      >
                        {i < 2 ? "✓" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

function GenderOption({
  icon: Icon,
  label,
  sub,
  active,
  onClick,
}: {
  icon: typeof User2;
  label: string;
  sub: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 rounded-xl border bg-card/60 p-2.5 text-left transition-all",
        active
          ? "border-primary bg-primary/10 ring-2 ring-primary/30"
          : "border-border/60 hover:border-primary/40",
      )}
    >
      <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
      <span className="text-xs font-semibold">{label}</span>
      <span className="text-[10px] text-muted-foreground">{sub}</span>
    </button>
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
          className="w-full rounded-xl border border-border bg-card/70 px-3 py-2 pr-8 text-sm outline-none focus:ring-4 focus:ring-primary/20"
        />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
          {suffix}
        </span>
      </div>
    </label>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/70 p-2">
      <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-base font-semibold">{value}</p>
      <p className="text-[9px] text-muted-foreground">{sub}</p>
    </div>
  );
}
