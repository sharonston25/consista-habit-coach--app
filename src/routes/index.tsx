import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ConsistaLogo } from "@/components/ConsistaLogo";
import { SplashScreen } from "@/components/SplashScreen";
import { hasVisited, markVisited, useProfile } from "@/lib/habits/store";
import type { Gender } from "@/lib/habits/types";
import { ArrowRight, Sparkles, BarChart3, Bell, Shield, User2, UserRound, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const [showSplash, setShowSplash] = useState(true);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | undefined>(undefined);
  const { profile, setProfile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    const visited = hasVisited();
    const t = setTimeout(() => {
      setShowSplash(false);
      if (visited && profile) {
        navigate({ to: "/dashboard" });
      }
    }, visited ? 700 : 1600);
    return () => clearTimeout(t);
  }, [navigate, profile]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setProfile({ name: trimmed, gender, createdAt: new Date().toISOString() });
    markVisited();
    navigate({ to: "/dashboard" });
  };

  if (showSplash) return <SplashScreen />;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_15%_10%,oklch(0.85_0.08_150_/_0.35),transparent_45%),radial-gradient(circle_at_85%_90%,oklch(0.85_0.08_95_/_0.3),transparent_45%)]" />

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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Calm. Consistent. Yours.
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Build the habit.
              <br />
              <span className="gradient-text">Be the change.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              A gentle, private habit tracker with daily notes, wellness logs, and an AI coach.
              Everything stays on your device.
            </p>

            <form onSubmit={handleStart} className="mt-7 space-y-4">
              <input
                type="text"
                placeholder="What's your name?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-card/70 px-4 py-3 text-base shadow-soft outline-none ring-primary/20 backdrop-blur transition-all focus:ring-4"
                maxLength={32}
              />

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Personalize (optional)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <GenderOption
                    icon={UserRound}
                    label="Female"
                    sub="Cycle tracking"
                    active={gender === "female"}
                    onClick={() => setGender("female")}
                  />
                  <GenderOption
                    icon={User2}
                    label="Male"
                    sub="Wellness logs"
                    active={gender === "male"}
                    onClick={() => setGender("male")}
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

              <button
                type="submit"
                disabled={!name.trim()}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-elegant transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                Start tracking
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>

            <div className="mt-7 grid grid-cols-2 gap-2.5 text-sm">
              {[
                { icon: BarChart3, text: "Charts & insights" },
                { icon: Sparkles, text: "AI coach + voice" },
                { icon: Bell, text: "Gentle reminders" },
                { icon: Shield, text: "Private & offline" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4 text-primary" /> {text}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="relative mx-auto aspect-[9/16] w-full max-w-[300px] rounded-[2rem] border-[6px] border-foreground/10 bg-card shadow-elegant">
              <div className="absolute left-1/2 top-2 h-1 w-14 -translate-x-1/2 rounded-full bg-foreground/15" />
              <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] p-5">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Today</div>
                <div className="mt-1 text-xl font-semibold">73% complete</div>
                <div className="mt-5 flex justify-center">
                  <div className="relative">
                    <ConsistaLogo size={130} animated />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-semibold gradient-text">73%</span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">today</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  {["💧 Water", "🚶 Walk", "📖 Read"].map((h, i) => (
                    <div
                      key={h}
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-sm"
                    >
                      <span>{h}</span>
                      <span
                        className={
                          i < 2
                            ? "h-5 w-5 rounded-md bg-success text-center text-[11px] leading-5 text-success-foreground"
                            : "h-5 w-5 rounded-md border-2 border-dashed border-border"
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
        "flex flex-col items-start gap-1 rounded-xl border bg-card/60 p-3 text-left transition-all",
        active
          ? "border-primary bg-primary/10 ring-2 ring-primary/30"
          : "border-border/60 hover:border-primary/40"
      )}
    >
      <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-[10px] text-muted-foreground">{sub}</span>
    </button>
  );
}
