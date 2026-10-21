import { env } from "../config/env.js";
import { ApiError } from "./errors.js";

const BASE = `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}`;

// One place for the key check, the retry on "high demand" (503) and the friendly errors.
async function geminiFetch(endpoint: string, body: unknown, timeoutMs: number, signal?: AbortSignal): Promise<Response> {
  if (!env.geminiApiKey) throw new ApiError(503, "The AI isn't set up yet (missing GEMINI_API_KEY).");

  let res: Response;
  try {
    for (let attempt = 1; ; attempt++) {
      res = await fetch(`${BASE}:${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.geminiApiKey },
        body: JSON.stringify(body),
        signal: signal ? AbortSignal.any([AbortSignal.timeout(timeoutMs), signal]) : AbortSignal.timeout(timeoutMs),
      });
      if (res.status !== 503 || attempt === 3) break; // the free tier says "high demand" sometimes
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  } catch {
    throw new ApiError(502, "The AI service didn't respond. Try again in a moment.");
  }

  if (res.status === 503) throw new ApiError(503, "The AI is busy right now. Try again in a minute.");
  if (res.status === 429) throw new ApiError(429, "The free AI quota is used up for now. Try again later.");
  if (!res.ok) {
    console.error("Gemini error", res.status, await res.text().catch(() => ""));
    throw new ApiError(502, "The AI service returned an error. Try again later.");
  }
  return res;
}

// Plain request/response: returns the whole answer at once.
export async function callGemini(body: unknown): Promise<any> {
  const res = await geminiFetch("generateContent", body, 45_000);
  return res.json();
}

// Streaming: calls onText for every piece of text as it arrives and returns all the parts of the model's turn.
// The parts come back exactly as received (function calls, thought signatures and all), because a tool-calling
// conversation must send the model's own turn back unchanged.
export async function streamGemini(body: unknown, onText: (text: string) => void, signal?: AbortSignal): Promise<any[]> {
  const res = await geminiFetch("streamGenerateContent?alt=sse", body, 60_000, signal);
  const parts: any[] = [];

  const handleLine = (line: string) => {
    if (!line.startsWith("data:")) return;
    let chunk: any;
    try {
      chunk = JSON.parse(line.slice(5).trim());
    } catch {
      return;
    }
    for (const part of chunk?.candidates?.[0]?.content?.parts ?? []) {
      parts.push(part);
      if (typeof part.text === "string" && !part.thought) onText(part.text);
    }
  };

  try {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let newline: number;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        handleLine(buffer.slice(0, newline).replace(/\r$/, ""));
        buffer = buffer.slice(newline + 1);
      }
    }
    if (buffer) handleLine(buffer);
  } catch {
    if (signal?.aborted) return parts; // the browser went away; nothing more to do
    throw new ApiError(502, "The AI connection dropped. Try again.");
  }
  return parts;
}
