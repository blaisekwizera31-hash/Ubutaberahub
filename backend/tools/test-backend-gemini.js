/**
 * Test Backend Gemini Initialization
 */

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: '.env' });

console.log('\n🧪 Testing Backend Gemini Initialization\n');
console.log('─'.repeat(60));

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

console.log('Step 1: Check API Key');
console.log('─'.repeat(60));
if (!GEMINI_API_KEY) {
  console.log('❌ API key not found in environment variables');
  console.log('\n💡 Make sure .env file has:');
  console.log('VITE_GEMINI_API_KEY=your_actual_key_here\n');
  process.exit(1);
}

console.log(`✅ API key found: ${GEMINI_API_KEY.substring(0, 10)}...`);
console.log(`   Length: ${GEMINI_API_KEY.length} characters\n`);

console.log('Step 2: Initialize Gemini AI');
console.log('─'.repeat(60));

try {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log('✅ Gemini AI object created successfully\n');
  
  console.log('Step 3: Get Model');
  console.log('─'.repeat(60));
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  console.log('✅ Gemini 2.5 Flash model loaded\n');
  
  console.log('Step 4: Test API Call');
  console.log('─'.repeat(60));
  console.log('Sending test request to Gemini...\n');
  
  const result = await model.generateContent('Say "Hello from Gemini!" in one sentence.');
  const response = result.response;
  const text = response.text();
  
  console.log('✅ SUCCESS! Gemini API is working!\n');
  console.log('Response from Gemini:');
  console.log('─'.repeat(60));
  console.log(text);
  console.log('─'.repeat(60));
  console.log('\n🎉 Your backend is ready to use Gemini AI!\n');
  
} catch (error) {
  console.log('❌ ERROR! Failed to initialize or use Gemini:\n');
  console.log('Error:', error.message);
  console.log('\n💡 Possible issues:');
  console.log('1. Invalid API key - get a new one from https://makersuite.google.com/app/apikey');
  console.log('2. API key quota exceeded - check your usage');
  console.log('3. Network issue - check your internet connection');
  console.log('4. API key not activated - make sure you created it correctly\n');
  process.exit(1);
}
