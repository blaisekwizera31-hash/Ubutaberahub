/**
 * Test Google Gemini API Key
 * Run: node test-gemini-api.js
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

const API_KEY = process.env.VITE_GEMINI_API_KEY;

async function testGeminiAPI() {
  console.log('\n🧪 Testing Google Gemini API...\n');
  
  // Check if API key exists
  if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
    console.log('❌ No API key found!');
    console.log('\n📝 To get your Gemini API key:');
    console.log('1. Go to: https://makersuite.google.com/app/apikey');
    console.log('2. Sign in with your Google account');
    console.log('3. Click "Create API Key"');
    console.log('4. Copy the key');
    console.log('5. Add it to .env.local file as VITE_GEMINI_API_KEY=your_key_here');
    console.log('\n💡 Note: If no API key is provided, the system will automatically use local AI fallback.\n');
    return;
  }

  console.log('✓ API key found');
  console.log(`Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 4)}\n`);

  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    console.log('📡 Sending test request to Gemini...\n');

    // Test with a legal question
    const prompt = `You are a legal assistant for Rwanda. Answer this question briefly:

What are the basic rights of a person who is arrested in Rwanda?

Provide a concise answer in 2-3 sentences.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('✅ SUCCESS! Gemini API is working!\n');
    console.log('📄 Response from Gemini:\n');
    console.log('─'.repeat(60));
    console.log(text);
    console.log('─'.repeat(60));
    console.log('\n🎉 Your AI is ready to use with Gemini!\n');
    console.log('💡 The AI will now use Gemini for intelligent responses.');
    console.log('💡 If Gemini fails, it will automatically fall back to local AI.\n');

  } catch (error) {
    console.log('❌ ERROR! Gemini API test failed:\n');
    console.log('Error message:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n💡 Fix: Your API key is invalid. Please check:');
      console.log('   1. Go to https://makersuite.google.com/app/apikey');
      console.log('   2. Create a new API key');
      console.log('   3. Update .env.local with the new key');
    } else if (error.message.includes('quota')) {
      console.log('\n💡 Fix: You may have exceeded your quota.');
      console.log('   Gemini has a free tier with limits.');
      console.log('   The system will use local AI fallback automatically.');
    } else {
      console.log('\n💡 Fix: Check your internet connection and try again.');
      console.log('   The system will use local AI fallback if Gemini is unavailable.');
    }
    
    console.log('\n📌 Note: Even if Gemini fails, your app will still work using local AI!\n');
  }
}

testGeminiAPI();
