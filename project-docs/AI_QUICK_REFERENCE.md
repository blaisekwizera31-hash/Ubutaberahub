# 🚀 Gemini AI Quick Reference

## ⚡ Quick Start (30 seconds)

1. Get API key: https://makersuite.google.com/app/apikey
2. Add to `.env.local`: `VITE_GEMINI_API_KEY=your_key_here`
3. Restart: `npm run dev`
4. Test: Navigate to `/ai-assistant`

## 📦 Import Statements

```typescript
// Main AI functions
import {
  chatWithAI,
  classifyCase,
  analyzeDocument,
  generateLegalGuidance,
  findSimilarCases,
  summarizeText,
  ChatMessage,
} from '@/services/ai/gemini';

// Document utilities
import {
  extractTextFromFile,
  validateFileForAI,
  prepareTextForAI,
} from '@/services/ai/documentExtractor';
```

## 🎯 Common Use Cases

### 1. Chat with AI
```typescript
const messages: ChatMessage[] = [
  { role: 'user', content: 'What are my rights?' }
];
const response = await chatWithAI(messages, 'en');
```

### 2. Classify Case
```typescript
const result = await classifyCase(
  "Employment dispute",
  "I was fired without notice..."
);
// Returns: { category, priority, confidence, reasoning }
```

### 3. Analyze Document
```typescript
const analysis = await analyzeDocument(
  documentText,
  "contract.pdf"
);
// Returns: { summary, keyPoints, parties, dates, ... }
```

### 4. Generate Guidance
```typescript
const guidance = await generateLegalGuidance(
  "Property Dispute",
  'en'
);
```

### 5. Find Similar Cases
```typescript
const similar = await findSimilarCases(
  "My case description",
  existingCases
);
```

### 6. Summarize Text
```typescript
const summary = await summarizeText(longText, 200);
```

## 🌍 Language Support

```typescript
// English
await chatWithAI(messages, 'en');

// Kinyarwanda
await chatWithAI(messages, 'rw');

// French
await chatWithAI(messages, 'fr');
```

## 🎨 React Component Pattern

```typescript
import { useState } from 'react';
import { chatWithAI, ChatMessage } from '@/services/ai/gemini';

function MyComponent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (userMessage: string) => {
    const newMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatWithAI(newMessages, 'en');
      setMessages([
        ...newMessages,
        { role: 'assistant', content: response }
      ]);
    } catch (err) {
      setError('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  return (/* Your UI */);
}
```

## 🔧 Configuration

### Change AI Model
```typescript
// In gemini.ts, line ~50
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-pro" // or "gemini-1.5-flash"
});
```

### Customize System Prompt
```typescript
// In gemini.ts, SYSTEM_PROMPTS object
const SYSTEM_PROMPTS = {
  legalAssistant: `Your custom prompt here...`,
};
```

## 📊 API Limits (Free Tier)

- **60** requests per minute
- **1,500** requests per day
- **1 million** tokens per month

## 🐛 Error Handling

```typescript
try {
  const response = await chatWithAI(messages, 'en');
  // Success
} catch (error) {
  if (error.message.includes('API key')) {
    // Invalid API key
  } else if (error.message.includes('quota')) {
    // Rate limit exceeded
  } else {
    // Other error
  }
}
```

## 🎯 Where AI is Used

| Page | Feature | Function |
|------|---------|----------|
| `/ai-assistant` | Chatbot | `chatWithAI()` |
| `/submit-case` | Classification | `classifyCase()` |
| Any upload | Document analysis | `analyzeDocument()` |
| Case search | Similar cases | `findSimilarCases()` |
| Long text | Summarization | `summarizeText()` |

## 📁 File Locations

```
src/
├── services/ai/
│   ├── gemini.ts           # Main AI service
│   ├── documentExtractor.ts # Document utils
│   └── examples.ts         # Code examples
├── pages/
│   ├── AIAssistant.tsx     # AI chat page
│   └── SubmitCase.tsx      # Enhanced with AI
└── App.tsx                 # Routes
```

## 🔗 Useful Links

- **API Key**: https://makersuite.google.com/app/apikey
- **Docs**: https://ai.google.dev/docs
- **Pricing**: https://ai.google.dev/pricing
- **Setup Guide**: `GEMINI_SETUP.md`
- **Full Guide**: `AI_INTEGRATION_GUIDE.md`

## 💡 Pro Tips

1. **First request is slow** - Cold start takes 2-5 seconds
2. **Cache common queries** - Save API calls
3. **Use flash model** - Faster responses for simple tasks
4. **Add loading states** - Better UX during API calls
5. **Handle errors gracefully** - Always show user-friendly messages
6. **Test with different languages** - Ensure multi-language works
7. **Monitor API usage** - Track quota in Google AI Studio
8. **Add rate limiting** - Prevent quota exhaustion

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| "API key not found" | Add to `.env.local` and restart |
| "Failed to get response" | Check internet, API key, quota |
| Slow responses | Normal for first request |
| TypeScript errors | Run `npm install` |
| 404 on /ai-assistant | Check route in App.tsx |

## 📞 Support

- Check browser console for errors
- Review `AI_INTEGRATION_GUIDE.md`
- See examples in `src/services/ai/examples.ts`
- Check Network tab for API requests

---

**Keep this handy while developing! 🎉**
