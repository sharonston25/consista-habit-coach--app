import { createFileRoute } from "@tanstack/react-router";

/**
 * Vision endpoint: takes a base64 image of a meal and returns
 * estimated calories + macros + ingredients.
 */
export const Route = createFileRoute("/api/vision")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const imageDataUrl: string | undefined = body?.image;
          if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
            return new Response(
              JSON.stringify({ error: "Please attach a photo of your meal." }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return new Response(
              JSON.stringify({ error: "AI is not configured." }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          const upstream = await fetch(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                  {
                    role: "system",
                    content: `You are a nutrition vision assistant. Look at the food photo and estimate the meal.
Return ONLY a compact JSON object with these keys (no prose, no markdown fences):
{
  "name": "Short dish name (max 5 words)",
  "kcal": integer total calories,
  "protein_g": integer grams of protein,
  "carbs_g": integer grams of carbs,
  "fat_g": integer grams of fat,
  "ingredients": ["short", "ingredient", "list"],
  "tip": "One short sentence — is this good for weight loss / gain / maintenance?",
  "confidence": "low" | "medium" | "high"
}
Be realistic. If the photo is unclear or not food, set kcal to 0 and tip to "I couldn't identify food in this photo — try a clearer angle."`,
                  },
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: "Estimate the calories and macros for this meal.",
                      },
                      {
                        type: "image_url",
                        image_url: { url: imageDataUrl },
                      },
                    ],
                  },
                ],
              }),
            },
          );

          if (!upstream.ok) {
            if (upstream.status === 429) {
              return new Response(
                JSON.stringify({ error: "Too many requests — try again in a moment." }),
                { status: 429, headers: { "Content-Type": "application/json" } },
              );
            }
            if (upstream.status === 402) {
              return new Response(
                JSON.stringify({
                  error: "AI credits exhausted. Add funds in Settings → Workspace → Usage.",
                }),
                { status: 402, headers: { "Content-Type": "application/json" } },
              );
            }
            const t = await upstream.text();
            console.error("vision gateway error:", upstream.status, t);
            return new Response(
              JSON.stringify({ error: "Vision service unavailable." }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          const data = await upstream.json();
          const raw: string = data?.choices?.[0]?.message?.content ?? "";
          // Strip fences if model added them
          const cleaned = raw
            .replace(/^```(?:json)?/i, "")
            .replace(/```$/i, "")
            .trim();
          let parsed: Record<string, unknown> = {};
          try {
            parsed = JSON.parse(cleaned);
          } catch {
            // Try to find a JSON block in the text
            const m = cleaned.match(/\{[\s\S]*\}/);
            if (m) {
              try {
                parsed = JSON.parse(m[0]);
              } catch {
                /* fallthrough */
              }
            }
          }

          if (!parsed || typeof parsed !== "object") {
            return new Response(
              JSON.stringify({ error: "Couldn't read the AI response. Try again." }),
              { status: 502, headers: { "Content-Type": "application/json" } },
            );
          }

          return new Response(JSON.stringify(parsed), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          console.error("vision error:", err);
          return new Response(
            JSON.stringify({
              error: err instanceof Error ? err.message : "Unknown error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
