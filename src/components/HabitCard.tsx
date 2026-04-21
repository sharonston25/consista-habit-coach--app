import { AnimatePresence, motion } from "framer-motion";
import type { Habit, HabitStatus } from "@/lib/habits/types";
import { Check, Minus, X, Bell, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: Habit;
  status: HabitStatus | undefined;
  streak: number;
  onCycle: () => void;
  onDelete?: () => void;
}

const colorBg: Record<string, string> = {
  water: "from-[oklch(0.65_0.18_230_/_0.18)] to-[oklch(0.65_0.18_230_/_0.05)]",
  exercise: "from-[oklch(0.7_0.21_35_/_0.18)] to-[oklch(0.7_0.21_35_/_0.05)]",
  study: "from-[oklch(0.6_0.22_285_/_0.18)] to-[oklch(0.6_0.22_285_/_0.05)]",
  read: "from-[oklch(0.65_0.2_165_/_0.18)] to-[oklch(0.65_0.2_165_/_0.05)]",
  sleep: "from-[oklch(0.55_0.18_260_/_0.18)] to-[oklch(0.55_0.18_260_/_0.05)]",
  meditation: "from-[oklch(0.7_0.18_320_/_0.18)] to-[oklch(0.7_0.18_320_/_0.05)]",
  walk: "from-[oklch(0.7_0.2_130_/_0.18)] to-[oklch(0.7_0.2_130_/_0.05)]",
  coding: "from-[oklch(0.6_0.2_200_/_0.18)] to-[oklch(0.6_0.2_200_/_0.05)]",
  primary: "from-[oklch(0.52_0.22_285_/_0.18)] to-[oklch(0.52_0.22_285_/_0.05)]",
  accent: "from-[oklch(0.7_0.2_320_/_0.18)] to-[oklch(0.7_0.2_320_/_0.05)]",
};

const dotColor: Record<string, string> = {
  water: "bg-[var(--habit-water)]",
  exercise: "bg-[var(--habit-exercise)]",
  study: "bg-[var(--habit-study)]",
  read: "bg-[var(--habit-read)]",
  sleep: "bg-[var(--habit-sleep)]",
  meditation: "bg-[var(--habit-meditation)]",
  walk: "bg-[var(--habit-walk)]",
  coding: "bg-[var(--habit-coding)]",
  primary: "bg-primary",
  accent: "bg-accent",
};

export function HabitCard({ habit, status, streak, onCycle, onDelete }: HabitCardProps) {
  const bg = colorBg[habit.color] ?? colorBg.primary;
  const dot = dotColor[habit.color] ?? dotColor.primary;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-card transition-all",
        bg,
        status === "done" && "border-success/40 ring-1 ring-success/20",
        status === "partial" && "border-warning/40 ring-1 ring-warning/20",
        status === "missed" && "border-destructive/30 opacity-80",
        !status && "border-border/60"
      )}
    >
      {status === "done" && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer dark:via-white/10" />
      )}

      <div className="relative flex items-center gap-3">
        <button
          onClick={onCycle}
          className={cn(
            "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl shadow-soft transition-transform active:scale-90",
            dot,
            "text-white"
          )}
          aria-label={`Cycle status for ${habit.name}`}
        >
          <span className="opacity-90">{habit.icon}</span>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold leading-tight">{habit.name}</h3>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {habit.reminder && (
              <span className="inline-flex items-center gap-1">
                <Bell className="h-3 w-3" /> {habit.reminder}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              🔥 <strong className="text-foreground">{streak}</strong> day{streak === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <StatusIcon status={status} onClick={onCycle} />
          {onDelete && (
            <button
              onClick={onDelete}
              className="rounded-lg p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              aria-label="Delete habit"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function StatusIcon({ status, onClick }: { status: HabitStatus | undefined; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all active:scale-90",
        status === "done" && "border-success bg-success text-success-foreground",
        status === "partial" && "border-warning bg-warning text-warning-foreground",
        status === "missed" && "border-destructive bg-destructive/10 text-destructive",
        !status && "border-dashed border-border bg-background/50 text-muted-foreground hover:border-primary"
      )}
      aria-label="Toggle habit status"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={status ?? "empty"}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 90 }}
          transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {status === "done" && <Check className="h-5 w-5" strokeWidth={3} />}
          {status === "partial" && <Minus className="h-5 w-5" strokeWidth={3} />}
          {status === "missed" && <X className="h-5 w-5" strokeWidth={3} />}
          {!status && <span className="text-xs">·</span>}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
