# Gemini AI Integration Guide

This guide explains how Gemini AI has been integrated into the Ubutaberahub legal tech platform.

## 🚀 Features Implemented

### 1. AI Legal Assistant Chatbot
- **Location**: `/ai-assistant` route
- **File**: `src/pages/AIAssistant.tsx`
- **Features**:
  - Real-time chat with Gemini AI
  - Multi-language support (English, Kinyarwanda, French)
  - Context-aware legal guidance for Rwandan law
  - Conversation history
  - Responsive UI with animations

### 2. AI-Powered Case Classification
- **Location**: Submit Case page
- **File**: `src/pages/SubmitCase.tsx`
- **Features**:
  - Automatic case categorization
  - Priority level suggestion
  - AI reasoning explanation
  - Auto-fill form fields based on analysis

### 3. AI Service Layer
- **File**: `src/services/ai/gemini.ts`
- **Functions**:
  - `chatWithAI()` - Chat interface for legal assistance
  - `analyzeDocument()` - Extract key information from documents
  - `classifyCase()` - Categorize and prioritize cases
  - `generateLegalGuidance()` - Create case-specific guidance
  - `findSimilarCases()` - Semantic search for similar cases
  - `summarizeText()` - Summarize long content

## 📦 Installation

### 1. Install Dependencies
```bash
npm install @google/generative-ai
```

### 2. Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 3. Configure Environment Variables
Add to your `.env.local` file:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## 🎯 Usage Examples

### Using the AI Chatbot
```typescript
import { chatWithAI, ChatMessage } from "@/services/ai/gemini";

const messages: ChatMessage[] = [
  { role: 'user', content: 'What are my rights if arrested?' }
];

const response = await chatWithAI(messages, 'en');
console.log(response);
```

### Classifying a Case
```typescript
import { classifyCase } from "@/services/ai/gemini";

const result = await classifyCase(
  "Property boundary dispute with neighbor",
  "My neighbor built a fence that extends 2 meters into my property..."
);

console.log(result);
// {
//   category: "Property Dispute",
//   priority: "medium",
//   confidence: 0.85,
//   reasoning: "This is a civil property matter requiring legal resolution..."
// }
```

### Analyzing Documents
```typescript
import { analyzeDocument } from "@/services/ai/gemini";

const analysis = await analyzeDocument(
  documentText,
  "contract.pdf"
);

console.log(analysis.summary);
console.log(analysis.keyPoints);
console.log(analysis.suggestedCategory);
```

## 🔧 Configuration

### System Prompts
The AI is configured with specialized prompts for different contexts:

1. **Legal Assistant**: Provides guidance on Rwandan law
2. **Document Analysis**: Extracts key information from legal documents
3. **Case Classification**: Categorizes cases into legal types

You can customize these prompts in `src/services/ai/gemini.ts`:

```typescript
const SYSTEM_PROMPTS = {
  legalAssistant: `Your custom prompt here...`,
  documentAnalysis: `Your custom prompt here...`,
  caseClassification: `Your custom prompt here...`,
};
```

### Model Selection
Currently using `gemini-1.5-flash` for fast responses. You can switch to other models:

```typescript
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-pro" // More capable but slower
});
```

## 🌍 Multi-Language Support

The AI automatically responds in the requested language:

```typescript
// English
await chatWithAI(messages, 'en');

// Kinyarwanda
await chatWithAI(messages, 'rw');

// French
await chatWithAI(messages, 'fr');
```

## 🎨 UI Components

### AI Assistant Page
- Full-screen chat interface
- Language selector (EN/RW/FR)
- Message history with animations
- Loading states
- Error handling

### Submit Case Enhancement
- "AI Analyze" button
- Real-time case classification
- Suggestion card with reasoning
- Auto-fill functionality

## 🔒 Security Considerations

1. **API Key Protection**: Never commit your API key to version control
2. **Rate Limiting**: Implement rate limiting for production
3. **Data Privacy**: Be cautious with sensitive legal data
4. **Error Handling**: All AI functions include try-catch blocks
5. **User Consent**: Inform users that AI is being used

## 📊 Future Enhancements

### Planned Features
1. **Document Upload Analysis**: OCR + AI analysis of uploaded PDFs
2. **Voice Input/Output**: Speech-to-text and text-to-speech
3. **Case Outcome Prediction**: ML-based predictions
4. **Lawyer Matching**: AI-powered lawyer recommendations
5. **Legal Document Generation**: Auto-generate contracts and forms
6. **Semantic Search**: Vector embeddings for case search
7. **Multi-turn Conversations**: Context-aware follow-ups
8. **Audit Logging**: Track all AI interactions

### Database Schema for AI Features
```sql
-- AI Interactions Log
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  interaction_type TEXT, -- 'chat', 'classification', 'analysis'
  input_text TEXT,
  output_text TEXT,
  language TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Case Classifications
CREATE TABLE case_classifications (
  id UUID PRIMARY KEY,
  case_id UUID REFERENCES cases(id),
  ai_category TEXT,
  ai_priority TEXT,
  confidence FLOAT,
  reasoning TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Document Analysis Results
CREATE TABLE document_analyses (
  id UUID PRIMARY KEY,
  document_id UUID,
  summary TEXT,
  key_points JSONB,
  parties JSONB,
  dates JSONB,
  legal_issues JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🐛 Troubleshooting

### API Key Not Working
- Verify the key is correct in `.env.local`
- Restart the development server after adding the key
- Check API key permissions in Google AI Studio

### No Response from AI
- Check your internet connection
- Verify API quota hasn't been exceeded
- Check browser console for errors

### Slow Responses
- Consider switching to `gemini-1.5-flash` for faster responses
- Implement caching for common queries
- Add loading indicators

## 📝 Testing

### Manual Testing Checklist
- [ ] AI Assistant page loads correctly
- [ ] Chat messages send and receive responses
- [ ] Language switching works
- [ ] Case classification suggests correct categories
- [ ] Error states display properly
- [ ] Loading states show during API calls

### Example Test Cases
```typescript
// Test case classification
const testCase = {
  title: "Employment contract dispute",
  description: "My employer terminated my contract without notice..."
};

const result = await classifyCase(testCase.title, testCase.description);
expect(result.category).toBe("Employment Law");
```

## 📚 Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Gemini Pricing](https://ai.google.dev/pricing)
- [Best Practices](https://ai.google.dev/docs/best_practices)

## 🤝 Contributing

When adding new AI features:
1. Add the function to `src/services/ai/gemini.ts`
2. Include proper TypeScript types
3. Add error handling
4. Update this documentation
5. Test with multiple languages
6. Consider rate limiting

## 📄 License

This AI integration is part of the Ubutaberahub project and follows the same license.

---

**Note**: Always ensure compliance with data privacy regulations when using AI with legal data. Consult with legal experts about data handling requirements in Rwanda.
