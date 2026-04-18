import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/coach")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const messages: Array<{ role: string; content: string }> = body?.messages ?? [];
          const context: string = body?.context ?? "";

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return new Response(
              JSON.stringify({ error: "Lovable AI is not configured." }),
              { status: 500, headers: { "Content-Type": "application/json" } }
            );
          }

          const systemPrompt = `You are Consista Coach — a warm, encouraging habit coach inside the Consista app.
Speak like a friend, not a lecture. Be concise, use plain language, and gently motivate.
You can also answer general questions (like ChatGPT) but always tie advice back to small, sustainable daily actions when relevant.
Use light markdown (short bullet points, **bold** for emphasis). Avoid huge replies — aim for 3-8 sentences unless the user asks for detail.

Here is the user's current context:
${context || "(no context)"}`;

          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              stream: true,
              messages: [{ role: "system", content: systemPrompt }, ...messages],
            }),
          });

          if (!upstream.ok) {
            if (upstream.status === 429) {
              return new Response(
                JSON.stringify({ error: "You're sending messages too fast. Take a breath and try again." }),
                { status: 429, headers: { "Content-Type": "application/json" } }
              );
            }
            if (upstream.status === 402) {
              return new Response(
                JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }),
                { status: 402, headers: { "Content-Type": "application/json" } }
              );
            }
            const t = await upstream.text();
            console.error("AI gateway error:", upstream.status, t);
            return new Response(JSON.stringify({ error: "AI service unavailable." }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(upstream.body, {
            headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
          });
        } catch (err) {
          console.error("coach error:", err);
          return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
