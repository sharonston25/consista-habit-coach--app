import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { ConsistaLogo } from "@/components/ConsistaLogo";
import { useTheme } from "@/hooks/use-theme";
import { useSettings, getSettings, setSettings as saveSettings, hasVisited } from "@/lib/habits/store";
import { Moon, Sun, Lock } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { theme, toggle } = useTheme();
  const { settings } = useSettings();
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasVisited()) {
      navigate({ to: "/" });
    }
  }, [navigate]);

  useEffect(() => {
    if (!settings.pinEnabled) setUnlocked(true);
  }, [settings.pinEnabled]);

  const handlePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.pin) {
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect PIN. Try again.");
      setPinInput("");
    }
  };

  const resetLock = () => {
    const s = getSettings();
    saveSettings({ ...s, pinEnabled: false, pin: undefined });
    setUnlocked(true);
  };

  if (settings.pinEnabled && !unlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm rounded-3xl border border-border/60 glass p-8 shadow-elegant"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">App locked</h2>
            <p className="text-sm text-muted-foreground">Enter your 4-digit PIN to continue.</p>
          </div>
          <form onSubmit={handlePin} className="mt-6 space-y-3">
            <input
              autoFocus
              type="password"
              inputMode="numeric"
              maxLength={4}
              pattern="[0-9]*"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none ring-primary/30 focus:ring-4"
              placeholder="••••"
            />
            {error && <p className="text-center text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-xl gradient-primary px-4 py-3 font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02]"
            >
              Unlock
            </button>
            <button
              type="button"
              onClick={resetLock}
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot PIN? Reset app lock
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  return (
    <div className="relative min-h-screen pb-24">
      <header className="sticky top-0 z-30 border-b border-border/40 glass">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <ConsistaLogo size={28} />
            <span className="text-base font-bold tracking-tight">Consista</span>
          </div>
          <button
            onClick={toggle}
            className="rounded-xl border border-border/60 bg-card/60 p-2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-5 animate-in fade-in duration-150">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
