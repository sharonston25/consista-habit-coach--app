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
You can answer general life and habit questions but always tie advice back to small, sustainable daily actions when relevant.
Use light markdown (short bullet points, **bold** for emphasis). Aim for 3–8 sentences unless the user asks for detail.

IMPORTANT — medical & nutritional safety:
- You are NOT a doctor, dietitian, or licensed therapist.
- If the user asks for **medical advice, symptom diagnosis, medication, mental-health crisis support, prescription nutrition plans for a condition (diabetes, PCOS, eating disorder, pregnancy, etc.), or anything beyond general wellness tips**, politely explain you can't replace a professional and recommend they speak with a **qualified doctor, registered dietitian, or licensed therapist**. For urgent issues mention contacting local emergency services.
- For general nutrition (e.g. "is oatmeal a good breakfast?"), you may share evidence-based tips, but still suggest seeing a dietitian for a personalised plan.
- Always be kind and non-judgemental about food, weight, or body topics.

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
