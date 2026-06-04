/**
 * models/gemini.js
 * Gemini AI client — single instance shared across the app
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

export const genAI =
  GEMINI_API_KEY && GEMINI_API_KEY !== "your_gemini_api_key_here"
    ? new GoogleGenerativeAI(GEMINI_API_KEY)
    : null;

/**
 * askGemini - Send a prompt to Gemini 2.5 Flash with one automatic retry
 * on transient upstream errors (rate limit, timeout, 5xx).
 */
export async function askGemini(prompt) {
  if (!genAI) {
    const err = new Error("Gemini not available");
    err.statusCode = 503;
    err.useLocalFallback = true;
    throw err;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const isTransient = (error) => {
    const status = Number(error?.status || error?.statusCode || 0);
    if ([429, 500, 502, 503, 504].includes(status)) return true;
    const msg = String(error?.message || "").toLowerCase();
    return (
      msg.includes("rate") ||
      msg.includes("quota") ||
      msg.includes("timeout") ||
      msg.includes("unavailable") ||
      msg.includes("overloaded")
    );
  };

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
