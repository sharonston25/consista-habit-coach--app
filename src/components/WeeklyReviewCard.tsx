import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Sparkles, Loader2 } from "lucide-react";
import { format, subDays } from "date-fns";
import { useHabits, useRecords, useNutrition, useWellness, useProfile } from "@/lib/habits/store";
import {
  consistencyScore,
  weeklyStreak,
  dayCompletion,
  dateKey,
  strongestHabit,
  weakestHabit,
} from "@/lib/habits/analytics";

function buildSummary(
  profile: { name: string } | null,
  habits: ReturnType<typeof useHabits>["habits"],
  records: ReturnType<typeof useRecords>["records"],
  nutrition: ReturnType<typeof useNutrition>["nutrition"],
  wellness: ReturnType<typeof useWellness>["wellness"],
) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));
  const dayLines = days.map((d) => {
    const k = dateKey(d);
    const c = Math.round(dayCompletion(habits, records, d) * 100);
    const meals = nutrition[k]?.meals.length ?? 0;
    const steps = nutrition[k]?.steps ?? 0;
    const sleep = wellness[k]?.sleepHours;
    return `- ${format(d, "EEE MMM d")}: habits ${c}%, ${meals} meals, ${steps} steps${sleep ? `, ${sleep}h sleep` : ""}`;
  });
  const strong = strongestHabit(habits, records);
  const weak = weakestHabit(habits, records);

  return [
    `Name: ${profile?.name ?? "friend"}`,
    `7-day consistency: ${consistencyScore(habits, records, 7)}%`,
    `Current streak: ${weeklyStreak(habits, records)} days`,
    `Strongest habit: ${strong ? strong.name : "n/a"}`,
    `Weakest habit: ${weak ? weak.name : "n/a"}`,
    "",
    "Daily breakdown:",
    ...dayLines,
  ].join("\n");
}

export function WeeklyReviewCard() {
  const { habits } = useHabits();
  const { records } = useRecords();
  const { nutrition } = useNutrition();
  const { wellness } = useWellness();
  const { profile } = useProfile();

  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    setReview("");
    try {
      const summary = buildSummary(profile, habits, records, nutrition, wellness);
      const resp = await fetch("/api/weekly-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed (${resp.status})`);
      }
      if (!resp.body) throw new Error("No stream");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const delta: string | undefined = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              setReview(acc);
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/5 to-accent/5 p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Weekly AI review</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Your last 7 days, summarised by your coach.
          </p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-105 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
            </>
          ) : review ? (
            "Regenerate"
          ) : (
            "Generate"
          )}
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

      {review && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="prose prose-sm mt-4 max-w-none rounded-2xl border border-border/60 bg-background/70 p-4 dark:prose-invert prose-headings:mt-3 prose-headings:mb-1 prose-h3:text-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0.5"
        >
          <ReactMarkdown>{review}</ReactMarkdown>
        </motion.div>
      )}

      {!review && !loading && !error && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Tap Generate for wins, gaps, and your one focus for next week.
        </p>
      )}
    </section>
  );
}
