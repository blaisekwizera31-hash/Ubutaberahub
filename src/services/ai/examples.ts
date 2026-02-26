/**
 * AI Integration Examples
 * This file contains example implementations showing how to use Gemini AI
 * in different parts of the application
 */

import {
  chatWithAI,
  analyzeDocument,
  classifyCase,
  generateLegalGuidance,
  findSimilarCases,
  summarizeText,
  ChatMessage,
} from './gemini';

// ============================================================================
// EXAMPLE 1: AI Chatbot with Conversation History
// ============================================================================

export async function exampleChatbot() {
  const conversationHistory: ChatMessage[] = [
    {
      role: 'user',
      content: 'What are my rights if I am arrested in Rwanda?',
    },
  ];

  // Get first response
  const response1 = await chatWithAI(conversationHistory, 'en');
  console.log('AI:', response1);

  // Add to history and continue conversation
  conversationHistory.push({ role: 'assistant', content: response1 });
  conversationHistory.push({
    role: 'user',
    content: 'How long can police hold me without charges?',
  });

  // Get follow-up response (AI has context from previous messages)
  const response2 = await chatWithAI(conversationHistory, 'en');
  console.log('AI:', response2);
}

// ============================================================================
// EXAMPLE 2: Automatic Case Classification on Form Submit
// ============================================================================

export async function exampleAutoClassification(formData: {
  title: string;
  description: string;
}) {
  try {
    // Classify the case
    const classification = await classifyCase(
      formData.title,
      formData.description
    );

    console.log('AI Classification:', classification);
    // {
    //   category: "Employment Law",
    //   priority: "high",
    //   confidence: 0.92,
    //   reasoning: "This involves wrongful termination which requires urgent attention..."
    // }

    // Use the classification to auto-fill form or suggest actions
    return {
      suggestedCategory: classification.category,
      suggestedPriority: classification.priority,
      aiConfidence: classification.confidence,
      explanation: classification.reasoning,
    };
  } catch (error) {
    console.error('Classification failed:', error);
    return null;
  }
}

// ============================================================================
// EXAMPLE 3: Document Analysis on Upload
// ============================================================================

export async function exampleDocumentAnalysis(documentText: string, fileName: string) {
  try {
    const analysis = await analyzeDocument(documentText, fileName);

    console.log('Document Summary:', analysis.summary);
    console.log('Key Points:', analysis.keyPoints);
    console.log('Parties Involved:', analysis.parties);
    console.log('Important Dates:', analysis.dates);
    console.log('Suggested Category:', analysis.suggestedCategory);
    console.log('Legal Issues:', analysis.legalIssues);

    // Use this to pre-fill case submission form
    return {
      summary: analysis.summary,
      extractedInfo: {
        parties: analysis.parties,
        dates: analysis.dates,
        issues: analysis.legalIssues,
      },
      suggestions: {
        category: analysis.suggestedCategory,
        priority: analysis.suggestedPriority,
      },
    };
  } catch (error) {
    console.error('Document analysis failed:', error);
    return null;
  }
}

// ============================================================================
// EXAMPLE 4: Generate Case-Specific Legal Guidance
// ============================================================================

export async function exampleLegalGuidance(caseType: string, language: 'en' | 'rw' | 'fr') {
  try {
    const guidance = await generateLegalGuidance(caseType, language);

    console.log(`Legal Guidance for ${caseType}:`, guidance);

    // Display this in a modal or info panel
    return guidance;
  } catch (error) {
    console.error('Failed to generate guidance:', error);
    return null;
  }
}

// ============================================================================
// EXAMPLE 5: Find Similar Cases (Semantic Search)
// ============================================================================

export async function exampleSimilarCases(newCaseDescription: string) {
  // Mock existing cases (in production, fetch from database)
  const existingCases = [
    {
      id: 'CASE-001',
      title: 'Property Boundary Dispute',
      description: 'Neighbor built fence on my land according to survey',
      type: 'Property Law',
    },
    {
      id: 'CASE-002',
      title: 'Employment Contract Termination',
      description: 'Fired without notice after 5 years of service',
      type: 'Employment Law',
    },
    {
      id: 'CASE-003',
      title: 'Land Title Verification',
      description: 'Need to verify authenticity of land documents',
      type: 'Property Law',
    },
  ];

  try {
    const similarCases = await findSimilarCases(newCaseDescription, existingCases);

    console.log('Similar Cases Found:');
    similarCases.forEach((match) => {
      console.log(`- Case ${match.id} (${(match.similarity * 100).toFixed(0)}% similar)`);
      console.log(`  Reason: ${match.reasoning}`);
    });

    return similarCases;
  } catch (error) {
    console.error('Similar case search failed:', error);
    return [];
  }
}

// ============================================================================
// EXAMPLE 6: Summarize Long Case Descriptions
// ============================================================================

export async function exampleSummarization(longText: string) {
  try {
    const summary = await summarizeText(longText, 150);

    console.log('Original length:', longText.length);
    console.log('Summary length:', summary.length);
    console.log('Summary:', summary);

    return summary;
  } catch (error) {
    console.error('Summarization failed:', error);
    return null;
  }
}

// ============================================================================
// EXAMPLE 7: Multi-Language Support
// ============================================================================

export async function exampleMultiLanguage() {
  const question = 'What documents do I need to file a property dispute case?';

  // Get response in English
  const englishResponse = await chatWithAI(
    [{ role: 'user', content: question }],
    'en'
  );
  console.log('English:', englishResponse);

  // Get response in Kinyarwanda
  const kinyarwandaResponse = await chatWithAI(
    [{ role: 'user', content: question }],
    'rw'
  );
  console.log('Kinyarwanda:', kinyarwandaResponse);

  // Get response in French
  const frenchResponse = await chatWithAI(
    [{ role: 'user', content: question }],
    'fr'
  );
  console.log('French:', frenchResponse);
}

// ============================================================================
// EXAMPLE 8: AI-Enhanced Search
// ============================================================================

export async function exampleAISearch(searchQuery: string, cases: any[]) {
  // Use AI to understand search intent and find relevant cases
  const searchPrompt = `Given this search query: "${searchQuery}"
  
  Which of these cases are most relevant? Return the case IDs in order of relevance.
  
  Cases:
  ${cases.map((c) => `${c.id}: ${c.title} - ${c.description}`).join('\n')}`;

  try {
    const messages: ChatMessage[] = [{ role: 'user', content: searchPrompt }];
    const response = await chatWithAI(messages, 'en');

    console.log('AI Search Results:', response);
    return response;
  } catch (error) {
    console.error('AI search failed:', error);
    return null;
  }
}

// ============================================================================
// EXAMPLE 9: Smart Form Validation
// ============================================================================

export async function exampleSmartValidation(formData: {
  title: string;
  description: string;
  caseType: string;
}) {
  const validationPrompt = `Review this case submission for completeness and accuracy:
  
  Title: ${formData.title}
  Type: ${formData.caseType}
  Description: ${formData.description}
  
  Provide feedback on:
  1. Is the description detailed enough?
  2. Does the case type match the description?
  3. What additional information would be helpful?
  
  Respond in JSON format with: { "isComplete": boolean, "feedback": string[], "suggestions": string[] }`;

  try {
    const messages: ChatMessage[] = [{ role: 'user', content: validationPrompt }];
    const response = await chatWithAI(messages, 'en');

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const validation = JSON.parse(jsonMatch[0]);
      return validation;
    }

    return null;
  } catch (error) {
    console.error('Smart validation failed:', error);
    return null;
  }
}

// ============================================================================
// EXAMPLE 10: Batch Processing
// ============================================================================

export async function exampleBatchProcessing(cases: Array<{ title: string; description: string }>) {
  console.log(`Processing ${cases.length} cases...`);

  const results = [];

  for (const caseItem of cases) {
    try {
      const classification = await classifyCase(caseItem.title, caseItem.description);
      results.push({
        case: caseItem,
        classification,
        status: 'success',
      });

      // Add delay to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({
        case: caseItem,
        classification: null,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  console.log('Batch processing complete:', results);
  return results;
}

// ============================================================================
// USAGE IN REACT COMPONENTS
// ============================================================================

/*
// In a React component:

import { chatWithAI, ChatMessage } from '@/services/ai/gemini';
import { useState } from 'react';

function MyComponent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (userMessage: string) => {
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await chatWithAI(newMessages, 'en');
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('AI Error:', error);
      // Show error to user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Your UI here
  );
}
*/
