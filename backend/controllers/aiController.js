/**
 * controllers/aiController.js
 */

import { askGemini } from "../config/gemini.js";

const mapLang = (l = "en") =>
  l === "rw" ? "Kinyarwanda" : l === "fr" ? "French" : "English";

export async function chat(req, res) {
  try {
    const { messages, language = "en" } = req.body;
    const last = messages.filter((m) => m.role === "user").pop();
    if (!last) return res.json({ response: "How can I help you with legal questions today?" });

    const text = await askGemini(
      `You are a legal assistant for Rwanda. Respond in ${mapLang(language)}.\n` +
      `Provide general legal information only and recommend speaking to a licensed lawyer.\n` +
      `User question: ${last.content}`
    );
    return res.json({ response: text });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      error: "Failed to generate response", message: err.message,
      useLocalFallback: !!err.useLocalFallback,
    });
  }
}

export async function classifyCase(req, res) {
  try {
    const { title, description } = req.body;
    const text = await askGemini(
      `Classify this Rwandan legal case and return valid JSON only.\n` +
      `Title: ${title}\nDescription: ${description}\n` +
      `Categories: Criminal Defense, Family Law, Property Dispute, Employment Law, Contract Dispute, Business Law, Other\n` +
      `Priority: low, medium, high\nJSON keys: category, priority, confidence, reasoning`
    );
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model returned non-JSON output");
    return res.json(JSON.parse(match[0]));
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      error: "Failed to classify case", message: err.message,
      useLocalFallback: !!err.useLocalFallback,
    });
  }
}

export async function analyzeDocument(req, res) {
  try {
    const { documentText, fileName } = req.body;
    const text = await askGemini(
      `Analyze this legal document for Rwanda and return JSON only.\n` +
      `Document: ${fileName}\nContent: ${String(documentText).slice(0, 3000)}\n` +
      `JSON keys: summary, keyPoints, parties, dates, suggestedCategory, suggestedPriority, legalIssues`
    );
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model returned non-JSON output");
    return res.json(JSON.parse(match[0]));
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      error: "Failed to analyze document", message: err.message,
      useLocalFallback: !!err.useLocalFallback,
    });
  }
}

export async function legalGuidance(req, res) {
  try {
    const { caseType, language = "en" } = req.body;
    const text = await askGemini(
      `Provide practical legal guidance in ${mapLang(language)} for Rwanda case type: ${caseType}.\n` +
      `Include: overview, rights, procedures, required documents, when to seek legal counsel.`
    );
    return res.json({ guidance: text });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      error: "Failed to generate guidance", message: err.message,
      useLocalFallback: !!err.useLocalFallback,
    });
  }
}

export async function summarize(req, res) {
  try {
    const { text, maxLength = 200 } = req.body;
    const summary = await askGemini(
      `Summarize this in ${Math.max(80, Number(maxLength) || 200)} characters or fewer:\n\n${text}`
    );
    return res.json({ summary });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      error: "Failed to summarize", message: err.message,
      useLocalFallback: !!err.useLocalFallback,
    });
  }
}
