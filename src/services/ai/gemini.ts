import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('Gemini API key not found. AI features will be limited.');
}

const genAI = new GoogleGenerativeAI(apiKey);

// System prompts for different contexts
const SYSTEM_PROMPTS = {
  legalAssistant: `You are a knowledgeable legal assistant for Rwanda's justice system. 
You provide guidance on Rwandan law, legal procedures, and rights. 
You can communicate in English, Kinyarwanda, and French.
Always clarify that you provide general guidance, not legal advice, and recommend consulting a licensed lawyer for specific cases.
Be respectful, clear, and culturally sensitive to Rwandan context.`,

  documentAnalysis: `You are a legal document analyzer specializing in Rwandan law.
Analyze documents to extract key information, identify legal issues, and provide summaries.
Focus on: parties involved, dates, legal claims, evidence, and potential legal categories.`,

  caseClassification: `You are a case classification expert for Rwanda's legal system.
Classify cases into categories: Family Law, Property Dispute, Criminal Defense, Employment Law, Contract Dispute, Business Law, or Other.
Also assess priority level (low, medium, high) based on urgency indicators.`,
};

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DocumentAnalysisResult {
  summary: string;
  keyPoints: string[];
  parties: string[];
  dates: string[];
  suggestedCategory: string;
  suggestedPriority: string;
  legalIssues: string[];
}

export interface CaseClassification {
  category: string;
  priority: string;
  confidence: number;
  reasoning: string;
}

/**
 * Chat with Gemini AI for legal assistance
 */
export async function chatWithAI(
  messages: ChatMessage[],
  language: 'en' | 'rw' | 'fr' = 'en'
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build conversation history
    const languageInstruction = language === 'rw' 
      ? 'Respond in Kinyarwanda.' 
      : language === 'fr' 
      ? 'Respond in French.' 
      : 'Respond in English.';

    const prompt = `${SYSTEM_PROMPTS.legalAssistant}\n\n${languageInstruction}\n\nConversation:\n${
      messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')
    }\n\nAssistant:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI Error:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
}

/**
 * Analyze legal document content
 */
export async function analyzeDocument(
  documentText: string,
  fileName: string
): Promise<DocumentAnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `${SYSTEM_PROMPTS.documentAnalysis}

Document Name: ${fileName}
Document Content:
${documentText}

Analyze this document and provide a JSON response with:
{
  "summary": "Brief summary of the document",
  "keyPoints": ["key point 1", "key point 2", ...],
  "parties": ["party names involved"],
  "dates": ["important dates mentioned"],
  "suggestedCategory": "one of: Family Law, Property Dispute, Criminal Defense, Employment Law, Contract Dispute, Business Law, Other",
  "suggestedPriority": "one of: low, medium, high",
  "legalIssues": ["identified legal issues"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Document Analysis Error:', error);
    throw new Error('Failed to analyze document. Please try again.');
  }
}

/**
 * Classify case based on description
 */
export async function classifyCase(
  title: string,
  description: string
): Promise<CaseClassification> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `${SYSTEM_PROMPTS.caseClassification}

Case Title: ${title}
Case Description: ${description}

Classify this case and provide a JSON response with:
{
  "category": "one of: Family Law, Property Dispute, Criminal Defense, Employment Law, Contract Dispute, Business Law, Other",
  "priority": "one of: low, medium, high",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation of classification"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Case Classification Error:', error);
    throw new Error('Failed to classify case. Please try again.');
  }
}

/**
 * Generate legal guidance based on case type
 */
export async function generateLegalGuidance(
  caseType: string,
  language: 'en' | 'rw' | 'fr' = 'en'
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const languageInstruction = language === 'rw' 
      ? 'Respond in Kinyarwanda.' 
      : language === 'fr' 
      ? 'Respond in French.' 
      : 'Respond in English.';

    const prompt = `${SYSTEM_PROMPTS.legalAssistant}

${languageInstruction}

Provide general guidance for someone dealing with a ${caseType} case in Rwanda.
Include:
1. Overview of this type of case
2. Common steps in the process
3. Important rights to know
4. What documents are typically needed
5. When to seek legal counsel

Keep it concise and practical.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Legal Guidance Error:', error);
    throw new Error('Failed to generate guidance. Please try again.');
  }
}

/**
 * Search and recommend similar cases (semantic search simulation)
 */
export async function findSimilarCases(
  caseDescription: string,
  existingCases: Array<{ id: string; title: string; description: string; type: string }>
): Promise<Array<{ id: string; similarity: number; reasoning: string }>> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const casesText = existingCases.map((c, i) => 
      `Case ${i + 1} (ID: ${c.id}): ${c.title}\nType: ${c.type}\nDescription: ${c.description}`
    ).join('\n\n');

    const prompt = `Compare this new case with existing cases and find the most similar ones:

New Case: ${caseDescription}

Existing Cases:
${casesText}

Provide a JSON array of the top 3 most similar cases with:
[
  {
    "id": "case id",
    "similarity": 0.0-1.0,
    "reasoning": "why this case is similar"
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('Similar Cases Error:', error);
    return [];
  }
}

/**
 * Summarize long text content
 */
export async function summarizeText(
  text: string,
  maxLength: number = 200
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Summarize the following text in approximately ${maxLength} characters or less. Keep the most important information:

${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Summarization Error:', error);
    throw new Error('Failed to summarize text. Please try again.');
  }
}
