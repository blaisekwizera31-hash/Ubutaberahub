/**
 * Test Backend Environment Variables
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

console.log('\n🔍 Testing Backend Environment Variables\n');
console.log('─'.repeat(60));

// Check all environment variables
console.log('Environment Variables Found:');
console.log('─'.repeat(60));

const vars = {
  'VITE_API_URL': process.env.VITE_API_URL,
  'VITE_SUPABASE_URL': process.env.VITE_SUPABASE_URL,
  'VITE_SUPABASE_ANON_KEY': process.env.VITE_SUPABASE_ANON_KEY,
  'VITE_GEMINI_API_KEY': process.env.VITE_GEMINI_API_KEY
};

for (const [key, value] of Object.entries(vars)) {
  if (value) {
    const preview = value.length > 20 ? `${value.substring(0, 20)}...` : value;
    console.log(`✅ ${key}: ${preview}`);
    console.log(`   Length: ${value.length} characters`);
  } else {
    console.log(`❌ ${key}: NOT FOUND`);
  }
  console.log('');
}

console.log('─'.repeat(60));

// Specific Gemini check
const geminiKey = process.env.VITE_GEMINI_API_KEY;

if (!geminiKey) {
  console.log('\n❌ PROBLEM: Gemini API key not found!');
  console.log('\n💡 Solution:');
  console.log('1. Check that .env file exists');
  console.log('2. Check that VITE_GEMINI_API_KEY is in .env');
  console.log('3. Make sure there are no spaces around the = sign');
  console.log('4. Restart the backend server\n');
} else if (geminiKey === 'your_gemini_api_key_here') {
  console.log('\n⚠️  WARNING: Using placeholder API key!');
  console.log('\n💡 Solution:');
  console.log('1. Get your API key from: https://makersuite.google.com/app/apikey');
  console.log('2. Replace "your_gemini_api_key_here" in .env file');
  console.log('3. Restart the backend server\n');
} else {
  console.log('\n✅ SUCCESS: Gemini API key found and looks valid!');
  console.log(`   Key: ${geminiKey.substring(0, 10)}...${geminiKey.substring(geminiKey.length - 4)}`);
  console.log(`   Length: ${geminiKey.length} characters`);
  console.log('\n🎉 Backend should be able to use Gemini AI!\n');
}
