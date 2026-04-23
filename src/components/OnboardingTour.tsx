import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, X, Target, Apple, MessageCircle, Lock } from "lucide-react";

const TOUR_KEY = "consista:tour:v1";

interface Step {
  emoji: string;
  title: string;
  body: string;
  icon: typeof Target;
}

const STEPS: Step[] = [
  {
    emoji: "👋",
    title: "Welcome to Consista",
    body: "Let's take 30 seconds to show you around. Everything stays on your device — fully private.",
    icon: Sparkles,
  },
  {
    emoji: "🎯",
    title: "Tap habits to log",
    body: "Each habit cycles: empty → done → partial → missed. One tap, no menus. Build your streak.",
    icon: Target,
  },
  {
    emoji: "🍎",
    title: "Nutrition with AI",
    body: "Use the camera in Nutrition to scan your plate — Consista estimates calories and macros instantly.",
    icon: Apple,
  },
  {
    emoji: "💬",
    title: "Your AI coach",
    body: "Stuck? Ask the Coach anything. It knows your data and gives advice tailored to your goals.",
    icon: MessageCircle,
  },
  {
    emoji: "🔒",
    title: "Lock it down",
    body: "Add a 4-digit PIN in Settings → Privacy to keep your data safe on shared devices.",
    icon: Lock,
  },
];

export function shouldShowTour(): boolean {
  if (typeof window === "undefined") return false;
  return !window.localStorage.getItem(TOUR_KEY);
}

export function markTourSeen() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOUR_KEY, new Date().toISOString());
}

export function resetTour() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOUR_KEY);
}

export function OnboardingTour({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const finish = () => {
    markTourSeen();
    onClose();
  };

  // ESC closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center"
        onClick={finish}
      >
        <motion.div
          key={step}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 240 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-t-3xl border-t border-border/60 bg-card p-6 shadow-elegant sm:rounded-3xl sm:border"
        >
          <button
            onClick={finish}
            aria-label="Close tour"
            className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-2xl shadow-glow">
              {current.emoji}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Step {step + 1} of {STEPS.length}
              </p>
              <h3 className="text-lg font-semibold tracking-tight">{current.title}</h3>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{current.body}</p>

          {/* Progress dots */}
          <div className="mt-5 flex items-center justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`Go to step ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm font-medium hover:bg-background"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            <button
              onClick={() => (isLast ? finish() : setStep(step + 1))}
              className="inline-flex flex-[2] items-center justify-center gap-1.5 rounded-xl gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.01]"
            >
              {isLast ? "Got it" : "Next"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={finish}
            className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            Skip tour
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
