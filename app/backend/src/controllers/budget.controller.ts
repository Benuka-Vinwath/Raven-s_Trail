import type { Response } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import { ApiError } from "../utils/errors.js";
import type { AuthedRequest } from "../middleware/auth.js";

const money = z.number().min(0).max(10_000_000);

const planSchema = z.object({
  trailSlug: z.string().min(1).max(120),
  people: z.number().int().min(1).max(100),
  days: z.number().int().min(1).max(30),
  style: z.enum(["budget", "standard", "comfortable"]),
  transport: z.string().trim().min(1).max(60),
  startingFrom: z.string().trim().max(60).optional(),
  budget: money.optional(),
  // line items are computed by the app; the model only reads them
  lines: z.array(z.object({ label: z.string().trim().min(1).max(40), amount: money })).min(1).max(12),
  total: money,
});

const responseSchema = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING" },
    itinerary: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { day: { type: "INTEGER" }, title: { type: "STRING" }, plan: { type: "STRING" } },
        required: ["day", "title", "plan"],
      },
    },
    savings: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { title: { type: "STRING" }, detail: { type: "STRING" }, savingLkr: { type: "INTEGER" } },
        required: ["title", "detail", "savingLkr"],
      },
    },
    packing: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["summary", "itinerary", "savings", "packing"],
};

const outputSchema = z.object({
  summary: z.string(),
  itinerary: z.array(z.object({ day: z.number(), title: z.string(), plan: z.string() })).max(30),
  savings: z.array(z.object({ title: z.string(), detail: z.string(), savingLkr: z.number() })).max(8),
  packing: z.array(z.string()).max(20),
});

export async function createBudgetPlan(req: AuthedRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  if (!env.geminiApiKey) throw new ApiError(503, "The AI planner isn't set up yet (missing GEMINI_API_KEY).");
  const b = planSchema.parse(req.body);

  const { rows } = await pool.query("SELECT * FROM trails WHERE slug = $1", [b.trailSlug]);
  const t = rows[0];
  if (!t) throw ApiError.notFound("Trail not found");

  // Totals are computed by the app, so the model only plans and advises; it never does the sums.
  const lines = b.lines.map((l) => `- ${l.label}: LKR ${l.amount}`).join("\n");
  const budgetLine =
    b.budget === undefined
      ? "No budget limit was given."
      : b.total <= b.budget
        ? `Budget limit: LKR ${b.budget}. The plan is LKR ${b.budget - b.total} under it.`
        : `Budget limit: LKR ${b.budget}. The plan is LKR ${b.total - b.budget} OVER it, so the savings must show how to close that gap.`;
  const prompt = `You are a trip planner for hikers in Sri Lanka. All money is in Sri Lankan rupees (LKR); prices are Sri Lankan resident rates.
Trail: ${t.name} (${t.district}), ${t.difficulty}, ${t.distance_km} km, ${t.elevation_gain_m} m climb, about ${t.duration_hrs} hours. Best season: ${t.best_season}. Tags: ${(t.tags ?? []).join(", ")}.
Trip: ${b.people} hiker(s), ${b.days} day(s), ${b.style} style, travelling by ${b.transport}${b.startingFrom ? `, starting from ${b.startingFrom}` : " (costs assume a start in Colombo)"}.
Cost lines worked out by the app:
${lines}
Total: LKR ${b.total} (LKR ${Math.round(b.total / b.people)} per person).
${budgetLine}
Reply with:
- "summary": two or three plain sentences on where the money goes and whether it is realistic for this trail.
- "itinerary": one entry per day (day numbers 1 to ${b.days}) with a short title and a practical plan for that day (when to start, what to eat or book, rest points). Fit the trail's real hiking time.
- "savings": 2 to 5 specific ways to spend less or stay safe on this trail, each with a one or two sentence detail and "savingLkr", your rough estimate of the saving (0 if it is not about money). If the plan is over budget, make these close the gap.
- "packing": 6 to 12 short items to bring or rent, suited to this trail, the season and the tags.
Do not change or recompute the totals, and do not invent exact prices for items not listed above.`;

  let upstream: globalThis.Response;
  try {
    // the free tier answers 503 "high demand" now and then; a couple of quick retries usually gets through
    for (let attempt = 1; ; attempt++) {
      upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": env.geminiApiKey },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json", responseSchema, temperature: 0.4 },
          }),
          signal: AbortSignal.timeout(45_000),
        }
      );
      if (upstream.status !== 503 || attempt === 3) break;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  } catch {
    throw new ApiError(502, "The AI service didn't respond. Try again in a moment.");
  }

  if (upstream.status === 503) throw new ApiError(503, "The AI is busy right now. Try again in a minute.");
  if (upstream.status === 429) throw new ApiError(429, "The free AI quota is used up for now. Try again later.");
  if (!upstream.ok) {
    console.error("Gemini error", upstream.status, await upstream.text().catch(() => ""));
    throw new ApiError(502, "The AI service returned an error. Try again later.");
  }

  const data: any = await upstream.json();
  try {
    const plan = outputSchema.parse(JSON.parse(data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""));
    res.json(plan);
  } catch {
    throw new ApiError(502, "The AI gave an unreadable answer. Try again.");
  }
}
