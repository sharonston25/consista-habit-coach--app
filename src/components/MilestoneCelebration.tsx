import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, Flame, Crown, X } from "lucide-react";

interface Props {
  streak: number;
  onClose: () => void;
}

const MILESTONES: Record<number, { emoji: string; title: string; sub: string; gradient: string }> = {
  7: {
    emoji: "🔥",
    title: "One Week Strong!",
    sub: "7 days of consistency. The habit is forming.",
    gradient: "from-[oklch(0.78_0.13_45)] to-[oklch(0.65_0.18_25)]",
  },
  14: {
    emoji: "⚡",
    title: "Two Weeks In!",
    sub: "14 days. Your brain is rewiring.",
    gradient: "from-[oklch(0.7_0.15_280)] to-[oklch(0.6_0.18_310)]",
  },
  30: {
    emoji: "💎",
    title: "Diamond Mind!",
    sub: "30 days. This is who you are now.",
    gradient: "from-[oklch(0.7_0.12_200)] to-[oklch(0.55_0.16_250)]",
  },
  60: {
    emoji: "🚀",
    title: "Two Months Strong!",
    sub: "60 days. Unstoppable momentum.",
    gradient: "from-[oklch(0.72_0.14_150)] to-[oklch(0.58_0.16_180)]",
  },
  100: {
    emoji: "👑",
    title: "Centurion!",
    sub: "100 days. You are legendary.",
    gradient: "from-[oklch(0.78_0.16_85)] to-[oklch(0.6_0.2_45)]",
  },
  365: {
    emoji: "🏆",
    title: "ONE YEAR!",
    sub: "365 days. A masterclass in consistency.",
    gradient: "from-[oklch(0.78_0.18_60)] to-[oklch(0.55_0.22_25)]",
  },
};

const CONFETTI_COLORS = [
  "oklch(0.78 0.16 45)",
  "oklch(0.7 0.15 280)",
  "oklch(0.72 0.14 150)",
  "oklch(0.78 0.13 200)",
  "oklch(0.78 0.16 85)",
];

export function MilestoneCelebration({ streak, onClose }: Props) {
  const data = MILESTONES[streak];
  if (!data) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Confetti */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: "50vw",
                y: "50vh",
                opacity: 1,
                scale: 0,
              }}
              animate={{
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
                opacity: 0,
                scale: 1,
                rotate: Math.random() * 720,
              }}
              transition={{
                duration: 1.4 + Math.random() * 0.8,
                ease: "easeOut",
                delay: Math.random() * 0.2,
              }}
              className="absolute h-2 w-2 rounded-sm"
              style={{
                backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.8, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 18, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          className="relative mx-4 w-full max-w-sm rounded-3xl border border-border/60 bg-card p-7 text-center shadow-elegant"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: "spring", damping: 12, stiffness: 200 }}
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br text-4xl shadow-glow ${data.gradient}`}
          >
            {data.emoji}
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Milestone unlocked
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">{data.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{data.sub}</p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1.5">
              <Flame className="h-3.5 w-3.5 text-[oklch(0.7_0.18_45)]" />
              <span className="text-sm font-semibold">{streak}-day streak</span>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl gradient-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
            >
              Keep going
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Returns the milestone number IF streak just hit one, else null. */
export function checkMilestone(streak: number, lastCelebrated: number | undefined): number | null {
  if (!MILESTONES[streak]) return null;
  if (lastCelebrated && lastCelebrated >= streak) return null;
  return streak;
}
