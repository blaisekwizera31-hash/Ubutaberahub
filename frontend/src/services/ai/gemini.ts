/**
 * AI Service - Calls Backend API for Gemini
 * With Local AI Fallback
 */

import * as LocalAI from './localAI';

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Export types from LocalAI
export type { ChatMessage, CaseClassification, DocumentAnalysisResult } from './localAI';

/**
 * Check if backend is available
 */
async function checkBackend(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return data.status === 'ok' && data.geminiAvailable;
  } catch (error) {
    return false;
  }
}

/**
 * Chat with AI - Calls backend, falls back to Local AI
 */
export async function chatWithAI(
  messages: LocalAI.ChatMessage[],
  language: 'en' | 'rw' | 'fr' = 'en'
): Promise<string> {
  const requestBackend = async () => {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, language })
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

    if (!payload?.response) {
      throw new Error('Empty AI response');
    }

    return payload.response as string;
  };

  try {
    return await requestBackend();
  } catch (error: any) {
    // One quick retry before fallback for transient backend/Gemini failures.
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return await requestBackend();
    } catch (retryError: any) {
      console.warn('API error, falling back to local AI:', retryError.message || error.message);
      return LocalAI.chatWithAI(messages, language);
    }
  }
}

/**
 * Classify case - Calls backend, falls back to Local AI
 */
export async function classifyCase(
  title: string,
  description: string
): Promise<LocalAI.CaseClassification> {
  try {
    const response = await fetch(`${API_URL}/api/classify-case`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.useLocalFallback) {
        return LocalAI.classifyCase(title, description);
      }
      throw new Error(error.error || 'Failed to classify');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Classification error, using local AI');
    return LocalAI.classifyCase(title, description);
  }
}

/**
 * Analyze document - Calls backend, falls back to Local AI
 */
export async function analyzeDocument(
  documentText: string,
  fileName: string
): Promise<LocalAI.DocumentAnalysisResult> {
  try {
    const response = await fetch(`${API_URL}/api/analyze-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentText, fileName })
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.useLocalFallback) {
        return LocalAI.analyzeDocument(documentText, fileName);
      }
      throw new Error(error.error || 'Failed to analyze');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Document analysis error, using local AI');
    return LocalAI.analyzeDocument(documentText, fileName);
  }
}

/**
 * Generate legal guidance - Calls backend, falls back to Local AI
 */
export async function generateLegalGuidance(
  caseType: string,
  language: 'en' | 'rw' | 'fr' = 'en'
): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/legal-guidance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseType, language })
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.useLocalFallback) {
        return LocalAI.generateLegalGuidance(caseType, language);
      }
      throw new Error(error.error || 'Failed to generate guidance');
    }

    const data = await response.json();
    return data.guidance;
  } catch (error) {
    console.warn('Legal guidance error, using local AI');
    return LocalAI.generateLegalGuidance(caseType, language);
  }
}

/**
 * Find similar cases - Uses local AI (no backend needed)
 */
export async function findSimilarCases(
  caseDescription: string,
  existingCases: Array<{ id: string; title: string; description: string; type: string }>
): Promise<Array<{ id: string; similarity: number; reasoning: string }>> {
  return LocalAI.findSimilarCases(caseDescription, existingCases);
}

/**
 * Summarize text - Calls backend, falls back to Local AI
 */
export async function summarizeText(
  text: string,
  maxLength: number = 200
): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, maxLength })
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.useLocalFallback) {
        return LocalAI.summarizeText(text, maxLength);
      }
      throw new Error(error.error || 'Failed to summarize');
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.warn('Summarization error, using local AI');
    return LocalAI.summarizeText(text, maxLength);
  }
}
