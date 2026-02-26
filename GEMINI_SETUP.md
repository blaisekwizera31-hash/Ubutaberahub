# Quick Gemini AI Setup Guide

## Step 1: Get Your API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Copy the generated API key (starts with `AIza...`)

## Step 2: Add API Key to Your Project

Open the file `.env.local` in your project root and add:

```env
VITE_GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

**Important**: Replace `your_gemini_api_key_here` with your actual API key!

## Step 3: Restart Development Server

If your dev server is running, restart it:

```bash
# Stop the server (Ctrl+C)
# Then start again
npm run dev
```

## Step 4: Test the Integration

### Test 1: AI Assistant Page
1. Log in to the application
2. Navigate to **AI Assistant** from the sidebar
3. Type a question like: "What are my rights if I'm arrested in Rwanda?"
4. You should get a detailed response in seconds!

### Test 2: Case Classification
1. Go to **Submit Case** page
2. Fill in:
   - **Title**: "Property boundary dispute"
   - **Description**: "My neighbor built a fence that extends into my property. I have the land title showing the correct boundaries."
3. Click the **"AI Analyze"** button
4. The AI will suggest:
   - Case Type: Property Dispute
   - Priority: Medium
   - Reasoning for the classification

## Troubleshooting

### "Failed to get AI response"
- ✅ Check that your API key is correct in `.env.local`
- ✅ Make sure you restarted the dev server
- ✅ Verify your internet connection
- ✅ Check if you have API quota remaining (free tier has limits)

### API Key Not Found Warning
- ✅ Ensure the file is named `.env.local` (not `.env`)
- ✅ The key should start with `VITE_` prefix
- ✅ No spaces around the `=` sign
- ✅ Restart your development server

### Slow Responses
- This is normal for the first request (cold start)
- Subsequent requests should be faster
- Consider upgrading to Gemini Pro for faster responses

## Free Tier Limits

Gemini API Free Tier:
- **60 requests per minute**
- **1,500 requests per day**
- **1 million tokens per month**

This is more than enough for development and testing!

## Next Steps

Once everything is working:

1. ✅ Explore the AI Assistant with different questions
2. ✅ Test case classification with various case types
3. ✅ Try different languages (English, Kinyarwanda, French)
4. ✅ Read the full [AI Integration Guide](./AI_INTEGRATION_GUIDE.md)

## Need Help?

- 📖 [Gemini API Documentation](https://ai.google.dev/docs)
- 💬 Check the browser console for error messages
- 🐛 Look at the Network tab to see API requests

---

**Ready to go?** Start chatting with your AI legal assistant! 🚀
