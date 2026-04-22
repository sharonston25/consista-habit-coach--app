import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/weekly-review")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const summary: string = body?.summary ?? "";

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return new Response(
              JSON.stringify({ error: "AI is not configured." }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          const systemPrompt = `You are Consista Coach writing the user's WEEKLY REVIEW.
Tone: warm, concise, non-judgmental, like a friend reviewing the week with them.

Output strict markdown in EXACTLY these 4 sections, in order:

### 🌟 Wins
2-3 short bullets celebrating what went well.

### 📉 Gaps
1-2 honest but kind bullets on what slipped.

### 🎯 Focus next week
1 single, specific micro-action (max 12 words).

### 💬 One line for you
A 1-sentence motivational note (no clichés).

Keep the whole review under 140 words. Never give medical or prescription advice.`;

          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              stream: true,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Here is my last 7 days:\n\n${summary}\n\nWrite my weekly review.` },
              ],
            }),
          });

          if (!upstream.ok) {
            if (upstream.status === 429) {
              return new Response(
                JSON.stringify({ error: "Slow down a moment, then try again." }),
                { status: 429, headers: { "Content-Type": "application/json" } },
              );
            }
            if (upstream.status === 402) {
              return new Response(
                JSON.stringify({ error: "AI credits exhausted." }),
                { status: 402, headers: { "Content-Type": "application/json" } },
              );
            }
            return new Response(JSON.stringify({ error: "AI service unavailable." }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(upstream.body, {
            headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
          });
        } catch (err) {
          console.error("weekly-review error:", err);
          return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
