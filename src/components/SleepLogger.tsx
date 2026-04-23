import { Moon, Sunrise, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  hours: number | undefined;
  bedtime?: string; // HH:mm
  wakeTime?: string; // HH:mm
  quality?: number; // 1-5
  onChange: (patch: { sleepHours?: number; bedtime?: string; wakeTime?: string; sleepQuality?: number }) => void;
}

function diffHours(bedtime: string, wakeTime: string): number {
  const [bh, bm] = bedtime.split(":").map(Number);
  const [wh, wm] = wakeTime.split(":").map(Number);
  let mins = wh * 60 + wm - (bh * 60 + bm);
  if (mins < 0) mins += 24 * 60;
  return +(mins / 60).toFixed(1);
}

export function SleepLogger({ hours, bedtime, wakeTime, quality, onChange }: Props) {
  const handleBedtime = (v: string) => {
    const next: Parameters<typeof onChange>[0] = { bedtime: v };
    if (wakeTime) next.sleepHours = diffHours(v, wakeTime);
    onChange(next);
  };
  const handleWakeTime = (v: string) => {
    const next: Parameters<typeof onChange>[0] = { wakeTime: v };
    if (bedtime) next.sleepHours = diffHours(bedtime, v);
    onChange(next);
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-[oklch(0.6_0.08_255_/_0.12)] p-4 shadow-soft dark:bg-[oklch(0.28_0.07_260_/_0.4)]">
      <div className="flex items-center gap-2">
        <Moon className="h-4 w-4 text-[oklch(0.5_0.1_260)] dark:text-[oklch(0.78_0.09_255)]" />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sleep
        </p>
        {typeof hours === "number" && hours > 0 && (
          <span className="ml-auto text-xs font-semibold">
            {hours}h <span className="text-muted-foreground font-normal">total</span>
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <Moon className="h-3 w-3" /> Bedtime
          </span>
          <input
            type="time"
            value={bedtime ?? ""}
            onChange={(e) => handleBedtime(e.target.value)}
            className="rounded-lg border border-border bg-background/70 px-2 py-1.5 text-sm outline-none ring-primary/20 focus:ring-4"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <Sunrise className="h-3 w-3" /> Wake
          </span>
          <input
            type="time"
            value={wakeTime ?? ""}
            onChange={(e) => handleWakeTime(e.target.value)}
            className="rounded-lg border border-border bg-background/70 px-2 py-1.5 text-sm outline-none ring-primary/20 focus:ring-4"
          />
        </label>
      </div>

      <div className="mt-3">
        <p className="mb-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <Star className="h-3 w-3" /> Quality
        </p>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => onChange({ sleepQuality: quality === n ? undefined : n })}
              aria-label={`Quality ${n} of 5`}
              className={cn(
                "flex-1 rounded-lg border py-1.5 text-base transition-all",
                (quality ?? 0) >= n
                  ? "border-[oklch(0.55_0.12_260)] bg-[oklch(0.55_0.12_260)]/15 text-[oklch(0.45_0.14_260)] dark:text-[oklch(0.8_0.11_260)]"
                  : "border-border bg-background/40 text-muted-foreground hover:border-[oklch(0.55_0.12_260)]/40"
              )}
            >
              ★
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
