

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

export const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";

// ── Validate key format before even creating the client ───────────────────────
const isValidKey = (key) =>
  typeof key === "string" &&
  key.trim().length > 10 &&
  key !== "your_gemini_api_key_here" &&
  key !== "your-gemini-api-key" &&
  !key.toLowerCase().includes("placeholder") &&
  !key.toLowerCase().includes("your_") &&
  !key.toLowerCase().includes("your-");

if (!GEMINI_API_KEY) {
  console.error("[gemini] ❌  GEMINI_API_KEY is not set in .env");
} else if (!isValidKey(GEMINI_API_KEY)) {
  console.error("[gemini] ❌  GEMINI_API_KEY looks like a placeholder]");
}

export const genAI =
  GEMINI_API_KEY && isValidKey(GEMINI_API_KEY)
    ? new GoogleGenerativeAI(GEMINI_API_KEY.trim())
    : null;

if (!genAI) {
  console.warn("[gemini] ⚠️  AI features will use local fallback — genAI client is null.");
}

// ── Test connection by sending a minimal prompt ───────────────────────────────
export async function testGeminiConnection() {
  if (!genAI) {
    console.error("❌  Gemini: client not initialized — check GEMINI_API_KEY in .env");
    return false;
  }

  try {
    const model  = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent("Reply with only the word: ok");
    const text   = result.response.text().trim().toLowerCase();

    if (text.includes("ok")) {
      console.log(`✅  Gemini: connected successfully (model: ${GEMINI_MODEL})`);
    } else {
      console.log(`✅  Gemini: responded (model: ${GEMINI_MODEL}) — reply: "${text}"`);
    }
    return true;
  } catch (err) {
    const status = err?.status || err?.statusCode || "unknown";

    if (String(err.message).includes("API_KEY_INVALID") || status === 400 || status === 401) {
      console.error("❌  Gemini: invalid API key — get a valid key at https://aistudio.google.com/app/apikey");
    } else if (status === 429) {
      console.error("❌  Gemini: quota exceeded — check your plan at https://aistudio.google.com");
    } else if ([500, 502, 503, 504].includes(Number(status))) {
      console.error(`❌  Gemini: server error (${status}) — Gemini may be temporarily unavailable`);
    } else {
      console.error(`❌  Gemini: connection failed — ${err.message}`);
    }
    return false;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const isTransient = (error) => {
  const status = Number(error?.status || error?.statusCode || 0);
  if ([429, 500, 502, 503, 504].includes(status)) return true;
  const msg = String(error?.message || "").toLowerCase();
  return (
    msg.includes("rate")       ||
    msg.includes("quota")      ||
    msg.includes("timeout")    ||
    msg.includes("unavailable")||
    msg.includes("overloaded")
  );
};

/**
 * askGemini — Send a prompt to Gemini with one automatic retry on transient errors.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
export async function askGemini(prompt) {
  if (!genAI) {
    const err = new Error("Gemini not available");
    err.statusCode = 503;
    err.useLocalFallback = true;
    throw err;
  }

  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    if (!isTransient(error)) throw error;
    await new Promise((r) => setTimeout(r, 600));
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

/**
 * askGeminiWithMeta — Like askGemini but also returns latency and token usage.
 * @param {string} prompt
 * @returns {Promise<{ text: string, latencyMs: number, tokensUsed: number, model: string }>}
 */
export async function askGeminiWithMeta(prompt) {
  if (!genAI) {
    const err = new Error("Gemini not available");
    err.statusCode = 503;
    err.useLocalFallback = true;
    throw err;
  }

  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const start = Date.now();

  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (error) {
    if (!isTransient(error)) throw error;
    await new Promise((r) => setTimeout(r, 600));
    result = await model.generateContent(prompt);
  }

  const latencyMs  = Date.now() - start;
  const tokensUsed =
    result.response?.usageMetadata?.totalTokenCount ||
    result.response?.usageMetadata?.candidatesTokenCount ||
    0;
  const text = result.response.text();

  return { text, latencyMs, tokensUsed, model: GEMINI_MODEL };
}