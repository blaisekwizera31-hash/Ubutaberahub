# Gemini AI Architecture Overview

## 📁 File Structure

```
Ubutaberahub/
├── src/
│   ├── services/
│   │   └── ai/
│   │       ├── gemini.ts              # Core AI service (7 functions)
│   │       ├── documentExtractor.ts   # Document processing utilities
│   │       └── examples.ts            # Usage examples & patterns
│   │
│   ├── pages/
│   │   ├── AIAssistant.tsx           # NEW: Full AI chatbot page
│   │   └── SubmitCase.tsx            # ENHANCED: Added AI classification
│   │
│   ├── components/
│   │   ├── sections/
│   │   │   └── AIAssistantSection.tsx # Landing page AI demo
│   │   └── Dashboard/
│   │       └── DashboardLayout.tsx    # Updated navigation
│   │
│   └── App.tsx                        # Added /ai-assistant route
│
├── .env.local                         # Added VITE_GEMINI_API_KEY
├── AI_INTEGRATION_GUIDE.md           # Complete guide
├── GEMINI_SETUP.md                   # Quick setup
└── AI_SETUP_COMPLETE.md              # This summary
```

## 🔄 Data Flow

### 1. AI Chatbot Flow
```
User Input (AIAssistant.tsx)
    ↓
chatWithAI(messages, language)
    ↓
Gemini API (gemini-1.5-flash)
    ↓
AI Response
    ↓
Display in Chat UI
```

### 2. Case Classification Flow
```
User fills form (SubmitCase.tsx)
    ↓
Clicks "AI Analyze"
    ↓
classifyCase(title, description)
    ↓
Gemini API analyzes content
    ↓
Returns: { category, priority, reasoning }
    ↓
Display suggestions + Auto-fill form
```

### 3. Document Analysis Flow (Ready to implement)
```
User uploads document
    ↓
extractTextFromFile(file)
    ↓
analyzeDocument(text, filename)
    ↓
Gemini API extracts info
    ↓
Returns: { summary, keyPoints, parties, dates, issues }
    ↓
Pre-fill case submission form
```

## 🎯 AI Service Functions

### Core Functions in `gemini.ts`

| Function | Purpose | Use Case |
|----------|---------|----------|
| **chatWithAI()** | Multi-turn conversation | AI Assistant page, help dialogs |
| **classifyCase()** | Auto-categorize cases | Submit Case form, case intake |
| **analyzeDocument()** | Extract document info | Document upload, evidence review |
| **generateLegalGuidance()** | Create guidance | Help center, case resources |
| **findSimilarCases()** | Semantic search | Case recommendations, research |
| **summarizeText()** | Condense content | Long descriptions, document summaries |

## 🌐 Integration Points

### Current Integrations

1. **AI Assistant Page** (`/ai-assistant`)
   - Full chatbot interface
   - Multi-language support
   - Conversation history
   - Error handling

2. **Submit Case Page** (`/submit-case`)
   - AI Analyze button
   - Case classification
   - Smart suggestions
   - Auto-fill fields

### Ready to Integrate

3. **Document Upload** (Any page with file upload)
   ```typescript
   import { analyzeDocument } from '@/services/ai/gemini';
   import { extractTextFromFile } from '@/services/ai/documentExtractor';
   
   const text = await extractTextFromFile(file);
   const analysis = await analyzeDocument(text, file.name);
   ```

4. **Case Search** (MyCases, LawyerCases, etc.)
   ```typescript
   import { findSimilarCases } from '@/services/ai/gemini';
   
   const similar = await findSimilarCases(caseDescription, existingCases);
   ```

5. **Legal Resources** (LegalResources page)
   ```typescript
   import { generateLegalGuidance } from '@/services/ai/gemini';
   
   const guidance = await generateLegalGuidance(caseType, language);
   ```

6. **Message Summarization** (Messages page)
   ```typescript
   import { summarizeText } from '@/services/ai/gemini';
   
   const summary = await summarizeText(longMessage, 200);
   ```

## 🔐 Security Architecture

```
Frontend (React)
    ↓
Environment Variable (VITE_GEMINI_API_KEY)
    ↓
AI Service Layer (gemini.ts)
    ↓
HTTPS Request
    ↓
Google Gemini API
    ↓
Response
    ↓
Error Handling & Validation
    ↓
User Interface
```

### Security Features
- ✅ API key in environment variables (not in code)
- ✅ Try-catch error handling on all functions
- ✅ Input validation and sanitization
- ✅ Response parsing and validation
- ✅ User disclaimers about AI limitations

## 🎨 UI Components

### AIAssistant Page Components
```
<AIAssistant>
  ├── <DashboardSidebar> (navigation)
  ├── <DashboardHeader> (search bar)
  └── <ChatContainer>
      ├── <LanguageSelector> (EN/RW/FR)
      ├── <MessageList>
      │   ├── <UserMessage>
      │   └── <AssistantMessage>
      ├── <LoadingIndicator>
      ├── <ErrorAlert>
      └── <InputArea>
          ├── <Input>
          └── <SendButton>
```

### SubmitCase AI Enhancement
```
<SubmitCase>
  └── <Form>
      ├── <TitleInput>
      ├── <DescriptionTextarea>
      ├── <AIAnalyzeButton> ← NEW
      ├── <AISuggestionCard> ← NEW
      │   ├── Category suggestion
      │   ├── Priority suggestion
      │   └── AI reasoning
      ├── <CategorySelect> (auto-filled)
      └── <PrioritySelect> (auto-filled)
```

## 📊 State Management

### AIAssistant State
```typescript
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [input, setInput] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [lang, setLang] = useState<'en' | 'rw' | 'fr'>('en');
```

### SubmitCase AI State
```typescript
const [aiSuggestion, setAiSuggestion] = useState<{
  category: string;
  priority: string;
  reasoning: string;
} | null>(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);
```

## 🚀 Performance Considerations

### Response Times
- First request: 2-5 seconds (cold start)
- Subsequent requests: 1-2 seconds
- Cached responses: Instant (if implemented)

### Optimization Strategies
1. **Debouncing**: Wait for user to finish typing
2. **Caching**: Store common responses
3. **Streaming**: Show partial responses (future)
4. **Parallel Requests**: Process multiple items simultaneously
5. **Rate Limiting**: Prevent API quota exhaustion

### Rate Limits (Free Tier)
- 60 requests per minute
- 1,500 requests per day
- 1 million tokens per month

## 🔄 Error Handling

### Error Flow
```
User Action
    ↓
Try {
  AI Function Call
    ↓
  Gemini API Request
    ↓
  Parse Response
    ↓
  Return Result
}
Catch (error) {
  Log Error
    ↓
  Show User-Friendly Message
    ↓
  Fallback Behavior
}
```

### Error Types Handled
- Network errors
- API key invalid
- Rate limit exceeded
- Invalid response format
- Timeout errors

## 📈 Future Architecture

### Phase 1: Current (✅ Complete)
- Basic chatbot
- Case classification
- Document analysis framework

### Phase 2: Enhanced Features
- Document upload + OCR
- Voice input/output
- Semantic search with embeddings
- Audit logging

### Phase 3: Advanced AI
- Case outcome prediction
- Lawyer matching algorithm
- Legal document generation
- Multi-agent workflows

### Phase 4: Production Ready
- Caching layer
- Rate limiting middleware
- Analytics dashboard
- A/B testing framework

## 🗄️ Database Schema (Future)

```sql
-- AI Interactions Log
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  interaction_type TEXT,
  input_text TEXT,
  output_text TEXT,
  language TEXT,
  model_used TEXT,
  tokens_used INTEGER,
  response_time_ms INTEGER,
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
  user_accepted BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Document Analyses
CREATE TABLE document_analyses (
  id UUID PRIMARY KEY,
  document_id UUID,
  case_id UUID REFERENCES cases(id),
  summary TEXT,
  key_points JSONB,
  parties JSONB,
  dates JSONB,
  legal_issues JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Feedback
CREATE TABLE ai_feedback (
  id UUID PRIMARY KEY,
  interaction_id UUID REFERENCES ai_interactions(id),
  user_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎓 Learning Resources

### For Developers
- `src/services/ai/examples.ts` - 10+ code examples
- `AI_INTEGRATION_GUIDE.md` - Complete guide
- `GEMINI_SETUP.md` - Quick start

### External Resources
- [Gemini API Docs](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Best Practices](https://ai.google.dev/docs/best_practices)

---

**This architecture provides a solid foundation for AI-powered legal tech features while maintaining security, performance, and scalability.**
