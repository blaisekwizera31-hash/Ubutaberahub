# 🎯 OpenAI API Key - Visual Step-by-Step Guide

## 📸 Step 1: Go to OpenAI Platform

**Link**: https://platform.openai.com/api-keys

**What you'll see:**
- OpenAI logo at the top
- Login/Signup buttons

![Step 1: OpenAI Platform Homepage]

---

## 📸 Step 2: Sign Up or Log In

### Option A: Sign Up (New Users)

1. Click **"Sign up"** button
2. Choose your method:
   - ✉️ **Email** - Enter your email and create password
   - 🔵 **Google** - Use your Gmail account (EASIEST!)
   - 🔷 **Microsoft** - Use your Microsoft account
   - 🍎 **Apple** - Use your Apple ID

**Recommended**: Use Google sign-up (fastest!)

### Option B: Log In (Existing Users)

1. Click **"Log in"**
2. Enter your credentials
3. Click **"Continue"**

**What you'll see after login:**
- Dashboard with navigation on the left
- "API keys" option in the menu

---

## 📸 Step 3: Navigate to API Keys

**In the left sidebar, click:**
- 🔑 **"API keys"**

**Or go directly to:**
```
https://platform.openai.com/api-keys
```

**What you'll see:**
- Page title: "API keys"
- Green button: "+ Create new secret key"
- List of your existing keys (if any)

---

## 📸 Step 4: Create New API Key

1. Click the green **"+ Create new secret key"** button

**A popup appears with:**
- **Name** field (optional but recommended)
- **Permissions** dropdown (leave as "All")
- **Create secret key** button

2. In the **Name** field, type:
   ```
   Ubutaberahub Legal App
   ```

3. Click **"Create secret key"**

---

## 📸 Step 5: Copy Your API Key

⚠️ **CRITICAL**: You can only see this key ONCE!

**The popup now shows:**
- Your API key (long string starting with `sk-proj-` or `sk-`)
- A **"Copy"** button
- Warning: "Please save this secret key somewhere safe"

**Your key looks like:**
```
sk-proj-abc123DEF456ghi789JKL012mno345PQR678stu901VWX234yz567ABC890def
```

**Do this NOW:**
1. Click the **"Copy"** button
2. Paste it somewhere safe:
   - Notepad
   - Password manager
   - Secure note app
3. Click **"Done"**

---

## 📸 Step 6: Add Key to Your Project

### 6.1 Open Your Project Folder

Navigate to:
```
Ubutaberahub/
```

### 6.2 Find the .env.local File

Look for a file named:
```
.env.local
```

**Can't see it?**
- It might be hidden
- In Windows: View → Show → Hidden items
- In VS Code: It should be visible

### 6.3 Open .env.local

Open it with any text editor:
- Notepad
- VS Code
- Notepad++

**You'll see:**
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://pbmwancclazpkiingwvr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI ChatGPT Configuration
# Get your API key from: https://platform.openai.com/api-keys
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 6.4 Replace the Placeholder

**Find this line:**
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

**Replace with your actual key:**
```env
VITE_OPENAI_API_KEY=sk-proj-abc123DEF456ghi789JKL012mno345PQR678stu901VWX234yz567ABC890def
```

**Important:**
- ✅ No spaces before or after the `=`
- ✅ Key should be on the same line
- ✅ No quotes around the key
- ✅ Starts with `sk-` or `sk-proj-`

### 6.5 Save the File

- Press **Ctrl + S** (Windows)
- Or **Cmd + S** (Mac)
- Or File → Save

---

## 📸 Step 7: Restart Development Server

### 7.1 Stop Current Server

**If your server is running:**

In your terminal/command prompt:
1. Press **Ctrl + C**
2. Wait for it to stop
3. You'll see the command prompt again

### 7.2 Start Server Again

**In your terminal, run:**
```bash
npm run dev
```

**Or double-click:**
```
START_SERVER.bat
```

**Wait for:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## 📸 Step 8: Test Your AI Integration

### 8.1 Open Browser

Go to:
```
http://localhost:5173
```

### 8.2 Log In

Use your existing account credentials

### 8.3 Navigate to AI Assistant

**Method 1: Sidebar**
- Look for "AI Assistant" in the left menu
- Click it

**Method 2: Direct URL**
```
http://localhost:5173/ai-assistant
```

### 8.4 Test the Chatbot

**What you should see:**
- Chat interface
- Language selector (English, Kinyarwanda, Français)
- Welcome message from AI
- Input box at the bottom

**Try this:**
1. Type in the input box:
   ```
   What are my rights if I am arrested in Rwanda?
   ```

2. Click **Send** button (or press Enter)

3. Wait 2-3 seconds

4. **Success!** You should see:
   - Loading indicator
   - Then a detailed response from ChatGPT
   - Information about rights in Rwanda

---

## 📸 Step 9: Test Case Classification

### 9.1 Go to Submit Case

Click **"Submit Case"** in the sidebar

### 9.2 Fill the Form

**Title:**
```
Property boundary dispute with neighbor
```

**Description:**
```
My neighbor built a fence that extends 2 meters into my property. I have the land title showing the correct boundaries. This happened last month and I've tried talking to them but they refuse to move it. I need legal help to resolve this issue.
```

### 9.3 Click "AI Analyze"

Look for the button with sparkle icon: ✨ **AI Analyze**

Click it!

### 9.4 See Results

**After 2-3 seconds, you should see:**

📊 **AI Analysis Results:**
- **Suggested Category**: Property Dispute
- **Suggested Priority**: Medium
- **Reasoning**: "This is a civil property matter involving boundary disputes. It requires legal resolution but is not immediately urgent..."

**The form fields should auto-fill!**

---

## ✅ Success Checklist

You know it's working when:

- [x] No error messages appear
- [x] AI responds to your questions
- [x] Responses are relevant and detailed
- [x] Case classification suggests correct categories
- [x] Loading indicators show during processing
- [x] You can switch languages (EN/RW/FR)

---

## 🐛 Common Issues & Solutions

### Issue 1: "Incorrect API key provided"

**What it means:**
- Your API key is wrong or incomplete

**Fix:**
1. Go back to OpenAI platform
2. Create a new API key
3. Copy it carefully (entire key)
4. Replace in `.env.local`
5. Restart server

### Issue 2: "You exceeded your current quota"

**What it means:**
- Free credits used up, OR
- No payment method added

**Fix:**
1. Go to: https://platform.openai.com/account/billing
2. Add a credit card
3. Set a spending limit (e.g., $5/month)

### Issue 3: No response, just loading forever

**What it means:**
- Network issue, OR
- API key not loaded

**Fix:**
1. Check internet connection
2. Check browser console (F12) for errors
3. Restart server
4. Clear browser cache (Ctrl+Shift+Delete)

### Issue 4: "Failed to get AI response"

**Fix:**
1. Open browser console (F12)
2. Look for red error messages
3. Check if API key is in `.env.local`
4. Make sure server restarted after adding key

---

## 💰 Check Your Usage

**Monitor your API usage:**

1. Go to: https://platform.openai.com/usage
2. See:
   - Requests made today
   - Tokens used
   - Cost so far
   - Remaining free credits

**Set spending limits:**

1. Go to: https://platform.openai.com/account/limits
2. Set monthly limit (e.g., $5)
3. Get email alerts

---

## 🎉 You're Done!

Your AI integration is now working with ChatGPT!

**What you can do now:**
- ✅ Chat with AI in 3 languages
- ✅ Get case classifications
- ✅ Analyze legal documents
- ✅ Generate legal guidance
- ✅ Find similar cases

**Next steps:**
- Explore different AI features
- Test with various case types
- Try different languages
- Monitor your usage

---

## 📞 Need Help?

**If you're stuck:**

1. Check browser console (F12) for errors
2. Review this guide again
3. Check `.env.local` file
4. Verify API key is correct
5. Make sure server restarted

**Still having issues?**
- Check OpenAI status: https://status.openai.com/
- Review OpenAI docs: https://platform.openai.com/docs

---

**Congratulations! You've successfully integrated ChatGPT into your legal tech platform! 🚀**
