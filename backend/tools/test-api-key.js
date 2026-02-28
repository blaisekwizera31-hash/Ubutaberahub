// Quick test to verify Hugging Face API token works
import { HfInference } from '@huggingface/inference';

// Replace with your actual Hugging Face token
const apiKey = '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'; // Your token from .env.local

const hf = new HfInference(apiKey);

async function testAPI() {
  try {
    console.log('Testing Hugging Face API token...');
    console.log('Using model: HuggingFaceH4/zephyr-7b-beta');
    console.log('This is a reliable free model...\n');
    
    const response = await hf.chatCompletion({
      model: 'HuggingFaceH4/zephyr-7b-beta',
      messages: [
        { role: 'user', content: 'Say "Hugging Face API works!" if you can read this.' }
      ],
      max_tokens: 50,
    });

    console.log('✅ SUCCESS! Hugging Face API token is working!');
    console.log('Response:', response.choices[0]?.message?.content);
    console.log('\n🎉 Your AI is ready to use!');
  } catch (error) {
    console.error('❌ ERROR! Hugging Face API test failed:');
    console.error('Error message:', error.message);
    
    if (error.message.includes('401') || error.message.includes('token')) {
      console.error('\n💡 Fix: Your API token is invalid.');
      console.error('   Get a new token from: https://huggingface.co/settings/tokens');
    } else if (error.message.includes('rate limit') || error.message.includes('429')) {
      console.error('\n💡 Fix: Rate limit exceeded. Wait a minute and try again.');
    } else {
      console.error('\n💡 Fix: Try again in a moment. Free tier can be slow.');
    }
  }
}

testAPI();
