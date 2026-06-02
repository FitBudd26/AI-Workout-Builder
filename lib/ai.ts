import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

// Provider-agnostic AI abstraction. Defaults to Gemini Flash (free tier via
// Google AI Studio). Anthropic and OpenAI remain available if a key is set
// and AI_PROVIDER is switched.

export type AiProvider = "gemini" | "anthropic" | "openai";

export interface AiCompletionRequest {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AiCompletionResponse {
  text: string;
  provider: AiProvider;
}

function resolveProvider(): AiProvider {
  const fromEnv = (process.env.AI_PROVIDER || "").toLowerCase();
  if (fromEnv === "gemini") return "gemini";
  if (fromEnv === "openai") return "openai";
  if (fromEnv === "anthropic") return "anthropic";
  // Auto-select: prefer Gemini, then Anthropic, then OpenAI.
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "gemini";
}

export async function generateCompletion(
  req: AiCompletionRequest
): Promise<AiCompletionResponse> {
  const provider = resolveProvider();

  if (provider === "gemini") {
    return callGemini(req);
  }
  if (provider === "anthropic") {
    return callAnthropic(req);
  }
  return callOpenAI(req);
}

// ---------- Gemini (free tier via Google AI Studio) ----------
//
// We call the REST endpoint directly so there's no extra SDK dep, and so we
// can enforce JSON-mode via responseMimeType — Gemini Flash is fast and free
// but only reliably emits parseable JSON when this is set explicitly.
async function callGemini(req: AiCompletionRequest): Promise<AiCompletionResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Get a free key at https://aistudio.google.com/apikey and add it to .env.local"
    );
  }

  // Primary + fallback model. Free tier 2.5-flash frequently returns 503
  // ("high demand"); we try the primary first, then automatically fall back.
  const primary = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const fallback = primary === "gemini-2.5-flash" ? "gemini-2.0-flash" : "gemini-2.5-flash";

  const body = {
    systemInstruction: { parts: [{ text: req.systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: req.userPrompt }] }],
    generationConfig: {
      temperature: req.temperature ?? 0.55,
      maxOutputTokens: req.maxTokens ?? 2200,
      responseMimeType: "application/json",
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };

  try {
    return await callGeminiModel(primary, apiKey, body);
  } catch (err) {
    if (isRetryableGeminiError(err)) {
      return await callGeminiModel(fallback, apiKey, body);
    }
    throw err;
  }
}

// Single-model call with retry/backoff for transient 429/503 from Gemini.
async function callGeminiModel(
  model: string,
  apiKey: string,
  body: unknown
): Promise<AiCompletionResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${apiKey}`;

  const maxAttempts = 3;
  let lastErr: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = (await res.json()) as GeminiResponse;
      if (data.promptFeedback?.blockReason) {
        throw new Error(`Gemini blocked the prompt: ${data.promptFeedback.blockReason}`);
      }
      const candidate = data.candidates?.[0];
      if (!candidate) throw new Error("Gemini returned no candidates.");
      if (candidate.finishReason === "SAFETY") {
        throw new Error("Gemini blocked the response for safety reasons. Try rephrasing.");
      }
      const text = (candidate.content?.parts ?? [])
        .map((p) => p.text ?? "")
        .join("")
        .trim();
      if (!text) throw new Error("Gemini returned an empty response.");
      return { text, provider: "gemini" };
    }

    const errText = await res.text().catch(() => "");
    lastErr = new GeminiHttpError(
      res.status,
      `Gemini request failed (${res.status}). ${truncate(errText, 400)}`.trim()
    );

    if (res.status === 429 || res.status === 503) {
      if (attempt < maxAttempts) {
        await sleep(400 * Math.pow(2, attempt - 1)); // 400ms, 800ms, 1600ms
        continue;
      }
    }
    throw lastErr;
  }

  throw lastErr ?? new Error("Gemini request failed.");
}

class GeminiHttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function isRetryableGeminiError(err: unknown): boolean {
  return err instanceof GeminiHttpError && (err.status === 429 || err.status === 503);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
}

// ---------- Anthropic ----------
async function callAnthropic(req: AiCompletionRequest): Promise<AiCompletionResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is missing. Set it in .env.local or switch AI_PROVIDER to 'gemini'."
    );
  }
  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL || "claude-opus-4-7";
  const msg = await client.messages.create({
    model,
    max_tokens: req.maxTokens ?? 3000,
    temperature: req.temperature ?? 0.6,
    system: req.systemPrompt,
    messages: [{ role: "user", content: req.userPrompt }],
  });

  const text = msg.content
    .map((c) => (c.type === "text" ? c.text : ""))
    .join("")
    .trim();

  return { text, provider: "anthropic" };
}

// ---------- OpenAI ----------
async function callOpenAI(req: AiCompletionRequest): Promise<AiCompletionResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing. Set it in .env.local or switch AI_PROVIDER to 'gemini'."
    );
  }
  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || "gpt-4o";
  const completion = await openai.chat.completions.create({
    model,
    temperature: req.temperature ?? 0.6,
    max_tokens: req.maxTokens ?? 3000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: req.systemPrompt },
      { role: "user", content: req.userPrompt },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim() ?? "";
  return { text, provider: "openai" };
}
