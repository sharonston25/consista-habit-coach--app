import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ConsistaLogo } from "@/components/ConsistaLogo";
import { SplashScreen } from "@/components/SplashScreen";
import { hasVisited, markVisited, useProfile } from "@/lib/habits/store";
import { ArrowRight, Sparkles, BarChart3, Bell, Shield } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const [showSplash, setShowSplash] = useState(true);
  const [name, setName] = useState("");
  const { profile, setProfile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    const visited = hasVisited();
    const t = setTimeout(() => {
      setShowSplash(false);
      if (visited && profile) {
        navigate({ to: "/dashboard" });
      }
    }, visited ? 800 : 1800);
    return () => clearTimeout(t);
  }, [navigate, profile]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setProfile({ name: trimmed, createdAt: new Date().toISOString() });
    markVisited();
    navigate({ to: "/dashboard" });
  };

  if (showSplash) return <SplashScreen />;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_15%_10%,oklch(0.7_0.22_295_/_0.25),transparent_45%),radial-gradient(circle_at_85%_90%,oklch(0.7_0.2_320_/_0.2),transparent_45%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ConsistaLogo size={36} />
            <span className="text-xl font-bold tracking-tight">Consista</span>
          </div>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip →
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-12 py-10 md:grid-cols-2 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 glass px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Smart habit tracking, beautifully done
            </span>
            <h1 className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Build the habit.
              <br />
              <span className="gradient-text">Be the change.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              Track daily, weekly and yearly progress. Get gentle nudges from your AI coach.
              Everything stays on your device — private, fast, and offline-friendly.
            </p>

            <form onSubmit={handleStart} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="What's your name?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full flex-1 rounded-xl border border-border bg-card/60 px-4 py-3 text-base shadow-soft outline-none ring-primary/30 backdrop-blur transition-all focus:ring-4"
                maxLength={32}
              />
              <button
                type="submit"
                disabled={!name.trim()}
                className="group inline-flex items-center justify-center gap-2 rounded-xl gradient-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-elegant transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                Start tracking
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>

            <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
              {[
                { icon: BarChart3, text: "Daily / weekly / yearly analytics" },
                { icon: Sparkles, text: "AI coach with voice support" },
                { icon: Bell, text: "Gentle reminders" },
                { icon: Shield, text: "PIN lock & offline" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4 text-primary" /> {text}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="relative mx-auto aspect-[9/16] w-full max-w-[320px] rounded-[2.5rem] border-8 border-foreground/10 bg-gradient-to-b from-card to-background shadow-elegant">
              <div className="absolute left-1/2 top-2 h-1 w-16 -translate-x-1/2 rounded-full bg-foreground/20" />
              <div className="relative h-full w-full overflow-hidden rounded-[2rem] p-5">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Today</div>
                <div className="mt-1 text-2xl font-bold">73% complete</div>
                <div className="mt-5 flex justify-center">
                  <div className="relative">
                    <ConsistaLogo size={140} animated />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold gradient-text">73%</span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">today</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  {["💧 Water", "🏋️ Exercise", "📚 Study"].map((h, i) => (
                    <div
                      key={h}
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-card/70 px-3 py-2.5 text-sm"
                    >
                      <span>{h}</span>
                      <span
                        className={
                          i < 2
                            ? "h-6 w-6 rounded-md bg-success text-center text-xs leading-6 text-success-foreground"
                            : "h-6 w-6 rounded-md border-2 border-dashed border-border"
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
