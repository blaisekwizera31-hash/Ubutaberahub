/**
 * models/gemini.js
 * Gemini AI client — single instance shared across the app
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

export const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const genAI =
  GEMINI_API_KEY && GEMINI_API_KEY !== "your_gemini_api_key_here"
    ? new GoogleGenerativeAI(GEMINI_API_KEY)
    : null;

if (!genAI) console.warn("[gemini] GEMINI_API_KEY not set — AI features will use local fallback.");

const isTransient = (error) => {
  const status = Number(error?.status || error?.statusCode || 0);
  if ([429, 500, 502, 503, 504].includes(status)) return true;
  const msg = String(error?.message || "").toLowerCase();
  return (
    msg.includes("rate")      ||
    msg.includes("quota")     ||
    msg.includes("timeout")   ||
    msg.includes("unavailable")||
    msg.includes("overloaded")
  );
};

/**
 * askGemini - Send a prompt to Gemini with one automatic retry on transient errors.
 * Returns the response text string.
 *
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
    // Single retry after a short back-off
    await new Promise((r) => setTimeout(r, 600));
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

/**
 * askGeminiWithMeta - Like askGemini but also returns latency and token usage.
 * Used by aiLogController to persist performance data.
 *
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

  const latencyMs   = Date.now() - start;
  const tokensUsed  =
    result.response?.usageMetadata?.totalTokenCount ||
    result.response?.usageMetadata?.candidatesTokenCount ||
    0;
  const text = result.response.text();

  return { text, latencyMs, tokensUsed, model: GEMINI_MODEL };
}
