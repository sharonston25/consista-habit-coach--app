import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useHabits, useRecords, useProfile } from "@/lib/habits/store";
import {
  consistencyScore,
  dayCompletion,
  strongestHabit,
  weakestHabit,
  weeklyStreak,
} from "@/lib/habits/analytics";
import { Send, Sparkles, Mic, MicOff, Trash2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/coach")({
  component: Coach,
});

type ChatMsg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "consista:chat:v1";

function buildContext(profile: { name: string } | null, habits: ReturnType<typeof useHabits>["habits"], records: ReturnType<typeof useRecords>["records"]): string {
  const today = new Date();
  const todayPct = Math.round(dayCompletion(habits, records, today) * 100);
  const consist = consistencyScore(habits, records);
  const streak = weeklyStreak(habits, records);
  const strong = strongestHabit(habits, records);
  const weak = weakestHabit(habits, records);
  const list = habits.map((h) => `${h.icon} ${h.name}`).join(", ");
  return `User name: ${profile?.name ?? "friend"}
Today's completion: ${todayPct}%
30-day consistency: ${consist}%
Current streak: ${streak} days
Strongest habit: ${strong ? `${strong.icon} ${strong.name}` : "n/a"}
Weakest habit: ${weak ? `${weak.icon} ${weak.name}` : "n/a"}
All habits: ${list}`;
}

function Coach() {
  const { habits, mounted } = useHabits();
  const { records } = useRecords();
  const { profile } = useProfile();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<unknown>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;
    setInput("");
    setError("");
    const next: ChatMsg[] = [...messages, { role: "user", content: userText }];
    setMessages(next);
    setLoading(true);

    try {
      const resp = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.slice(-12),
          context: buildContext(profile, habits, records),
        }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed (${resp.status})`);
      }
      if (!resp.body) throw new Error("No response stream");

      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
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
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = {
                  ...copy[copy.length - 1],
                  content: copy[copy.length - 1].content + delta,
                };
                return copy;
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setMessages((m) => (m[m.length - 1]?.role === "assistant" && !m[m.length - 1].content ? m.slice(0, -1) : m));
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    const w = window as unknown as {
      SpeechRecognition?: new () => unknown;
      webkitSpeechRecognition?: new () => unknown;
    };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) {
      setError("Voice input isn't supported in this browser.");
      return;
    }
    if (listening) {
      (recognitionRef.current as { stop?: () => void } | null)?.stop?.();
      setListening(false);
      return;
    }
    const rec = new SR() as {
      lang: string;
      interimResults: boolean;
      continuous: boolean;
      start: () => void;
      stop: () => void;
      onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      onend: () => void;
      onerror: () => void;
    };
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const t = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ");
      setInput((cur) => (cur ? `${cur} ${t}` : t));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const clearChat = () => {
    if (confirm("Clear conversation?")) {
      setMessages([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
  };

  // Encouragement banner when consistency drops — only after mount to avoid SSR hydration mismatch
  const consist = mounted ? consistencyScore(habits, records, 7) : 0;
  const showNudge = mounted && messages.length === 0 && consist < 50 && habits.length > 0;

  const suggestions = [
    "How can I be more consistent?",
    "Why do I keep missing my workouts?",
    "Give me a 5-min stress relief plan.",
    "What habit should I focus on this week?",
  ];

  const profileMounted = useProfile().mounted;
  const displayName = profile?.name?.trim() || (profileMounted ? "there" : "");

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>
              Hi{" "}
              {displayName ? (
                <span className="text-primary">{displayName}</span>
              ) : (
                <span className="inline-block h-5 w-16 animate-pulse rounded bg-muted/60 align-middle" />
              )}
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Your calm habit coach. Ask anything.</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="rounded-xl border border-border/60 bg-card/60 p-2 text-muted-foreground hover:text-destructive"
            aria-label="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {showNudge && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-3 flex items-start gap-3 rounded-2xl border border-border/60 bg-card/70 p-4 shadow-soft"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Heart className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Hey, no pressure.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your last week's been a bit off ({consist}%). One tiny win today resets everything. Want to talk it through?
            </p>
          </div>
        </motion.div>
      )}

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto rounded-3xl border border-border/60 bg-card/40 p-4 shadow-card">
        {messages.length === 0 && !showNudge && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold">Hi {profile?.name ?? "there"} 👋</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                I'm your habit coach. Ask me about consistency, motivation, or anything else.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-soft",
                m.role === "user"
                  ? "gradient-primary text-primary-foreground"
                  : "border border-border/60 bg-background/80 text-foreground"
              )}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                  <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
          </motion.div>
        ))}

        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex">
            <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-2.5 text-sm">
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
              </span>
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-3 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={toggleVoice}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card/60 transition-colors",
            listening && "gradient-primary text-primary-foreground border-transparent"
          )}
          aria-label="Voice input"
        >
          {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything…"
          className="flex-1 rounded-xl border border-border bg-card/60 px-4 py-3 text-sm outline-none ring-primary/30 focus:ring-4"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-soft transition-transform hover:scale-105 disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
