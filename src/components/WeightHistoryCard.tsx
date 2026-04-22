import { useMemo, useState } from "react";
import { format, subDays, eachDayOfInterval, parseISO } from "date-fns";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from "recharts";
import { TrendingDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { useWeights, useProfile } from "@/lib/habits/store";
import { dateKey } from "@/lib/habits/analytics";

export function WeightHistoryCard() {
  const { weights, logWeight } = useWeights();
  const { profile } = useProfile();
  const [draft, setDraft] = useState<string>("");

  const today = useMemo(() => new Date(), []);
  const todayKey = dateKey(today);

  const data = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(today, 29), end: today });
    return days.map((d) => {
      const k = dateKey(d);
      return {
        short: format(d, "d"),
        full: format(d, "MMM d"),
        kg: weights[k] ?? null,
      };
    });
  }, [weights, today]);

  const entries = Object.entries(weights).sort(([a], [b]) => a.localeCompare(b));
  const latest = entries.at(-1)?.[1];
  const earliest = entries[0]?.[1];
  const delta = latest && earliest ? +(latest - earliest).toFixed(1) : null;

  const save = () => {
    const v = parseFloat(draft);
    if (!Number.isFinite(v) || v < 30 || v > 300) {
      toast.error("Enter a realistic weight (30–300 kg).");
      return;
    }
    logWeight(todayKey, v);
    toast.success(`Logged: ${v} kg`);
    setDraft("");
  };

  const targetKg = profile?.targetWeightKg;

  return (
    <section className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Weight history</p>
        </div>
        {delta !== null && (
          <span
            className={
              "rounded-full px-2 py-0.5 text-[10px] font-semibold " +
              (delta < 0
                ? "bg-success/15 text-success"
                : delta > 0
                  ? "bg-warning/20 text-warning-foreground"
                  : "bg-muted text-muted-foreground")
            }
          >
            {delta > 0 ? "+" : ""}
            {delta} kg this month
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/[^\d.]/g, ""))}
          inputMode="decimal"
          placeholder={latest ? `${latest} kg today` : "Today's weight (kg)"}
          className="flex-1 rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/20"
        />
        <button
          onClick={save}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft"
          aria-label="Log weight"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="short"
              tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={32}
              domain={["dataMin - 1", "dataMax + 1"]}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 11,
              }}
              formatter={(v) => [`${v} kg`, "Weight"]}
              labelFormatter={(_l, p) => p?.[0]?.payload?.full ?? ""}
            />
            {targetKg && (
              <ReferenceLine
                y={targetKg}
                stroke="var(--primary)"
                strokeDasharray="4 4"
                label={{ value: `Target ${targetKg}`, fontSize: 9, fill: "var(--primary)", position: "right" }}
              />
            )}
            <Line
              type="monotone"
              dataKey="kg"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ r: 2.5, fill: "var(--primary)" }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {entries.length === 0 ? (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Log your weight to see your trend over time.
        </p>
      ) : (
        <p className="mt-2 text-[11px] text-muted-foreground">
          {entries.length} entries · Last logged{" "}
          {format(parseISO(entries.at(-1)![0]), "MMM d")}
        </p>
      )}
    </section>
  );
}
