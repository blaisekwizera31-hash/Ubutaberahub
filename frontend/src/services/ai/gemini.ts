/**
 * AI Service - Gemini via backend API only
 */

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type CaseClassification = {
  category: string;
  priority: "low" | "medium" | "high";
  confidence: number;
  reasoning: string;
};

export type DocumentAnalysisResult = {
  summary: string;
  keyPoints: string[];
  parties: string[];
  dates: string[];
  suggestedCategory: string;
  suggestedPriority: string;
  legalIssues: string[];
};

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const detail = payload?.message || payload?.error || `HTTP ${response.status}`;
    throw new Error(detail);
  }

  return payload as T;
}

export async function chatWithAI(messages: ChatMessage[], language: "en" | "rw" | "fr" = "en"): Promise<string> {
  const data = await postJson<{ response: string }>("/api/chat", { messages, language });
  if (!data?.response) throw new Error("Empty AI response");
  return data.response;
}

export async function classifyCase(title: string, description: string): Promise<CaseClassification> {
  return postJson<CaseClassification>("/api/classify-case", { title, description });
}

export async function analyzeDocument(documentText: string, fileName: string): Promise<DocumentAnalysisResult> {
  return postJson<DocumentAnalysisResult>("/api/analyze-document", { documentText, fileName });
}

export async function generateLegalGuidance(caseType: string, language: "en" | "rw" | "fr" = "en"): Promise<string> {
  const data = await postJson<{ guidance: string }>("/api/legal-guidance", { caseType, language });
  return data.guidance;
}

export async function summarizeText(text: string, maxLength = 200): Promise<string> {
  const data = await postJson<{ summary: string }>("/api/summarize", { text, maxLength });
  return data.summary;
}

export async function findSimilarCases(
  caseDescription: string,
  existingCases: Array<{ id: string; title: string; description: string; type: string }>,
): Promise<Array<{ id: string; similarity: number; reasoning: string }>> {
  if (!existingCases.length) return [];

  const prompt = `Compare this case description against existing cases and return JSON array only.
Current case: ${caseDescription}
Existing cases: ${JSON.stringify(existingCases).slice(0, 5000)}
Return up to 5 matches with keys: id, similarity (0-100 number), reasoning.`;

  const raw = await chatWithAI([{ role: "user", content: prompt }], "en");
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        id: String(item.id || ""),
        similarity: Number(item.similarity || 0),
        reasoning: String(item.reasoning || ""),
      }))
      .filter((item) => item.id);
  } catch {
    return [];
  }
}
