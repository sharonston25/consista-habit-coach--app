import { Droplet, Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  /** Current cups (1 cup = 250ml). */
  cups: number;
  /** Daily goal in cups. Default 8 (2L). */
  goal?: number;
  onChange: (cups: number) => void;
}

export function WaterTracker({ cups, goal = 8, onChange }: Props) {
  const safe = Math.max(0, cups);
  const pct = Math.min(100, Math.round((safe / goal) * 100));
  const ml = safe * 250;
  const goalMl = goal * 250;

  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-[oklch(0.92_0.05_220_/_0.5)] to-[oklch(0.94_0.04_240_/_0.4)] p-4 shadow-soft dark:from-[oklch(0.28_0.06_220_/_0.5)] dark:to-[oklch(0.26_0.05_240_/_0.4)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[oklch(0.65_0.12_220)]/15 text-[oklch(0.5_0.14_220)] dark:text-[oklch(0.78_0.13_220)]">
            <Droplet className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Water
            </p>
            <p className="text-lg font-semibold leading-none">
              {ml}
              <span className="text-xs text-muted-foreground"> / {goalMl} ml</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange(Math.max(0, safe - 1))}
            aria-label="Remove one cup"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/70 text-foreground hover:bg-background"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onChange(safe + 1)}
            aria-label="Add one cup"
            className="flex h-8 w-12 items-center justify-center gap-1 rounded-lg bg-[oklch(0.65_0.14_220)] text-white shadow-soft hover:scale-105"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="text-[10px] font-semibold">250</span>
          </button>
        </div>
      </div>

      {/* Cup visualization */}
      <div className="mt-3 flex items-end justify-between gap-1">
        {Array.from({ length: goal }).map((_, i) => {
          const filled = i < safe;
          return (
            <button
              key={i}
              onClick={() => onChange(filled && safe === i + 1 ? i : i + 1)}
              aria-label={`Set water to ${i + 1} cups`}
              className={cn(
                "relative h-10 flex-1 overflow-hidden rounded-md border transition-all",
                filled
                  ? "border-[oklch(0.55_0.14_220)] bg-[oklch(0.65_0.14_220)]/20"
                  : "border-border/60 bg-background/40 hover:border-[oklch(0.65_0.14_220)]/40"
              )}
            >
              {filled && (
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", damping: 18, stiffness: 200 }}
                  className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-[oklch(0.55_0.14_220)] to-[oklch(0.7_0.14_220)]"
                />
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {pct}% of daily goal · tap a cup to set, or use buttons
      </p>
    </div>
  );
}
