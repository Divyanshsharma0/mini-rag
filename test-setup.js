// Test script to verify Mini-RAG setup
const { exec } = require('child_process');
const fs = require('fs');

console.log('🧠 Mini-RAG System Setup Test\n');

// Check environment file
if (!fs.existsSync('.env.local')) {
  console.log('❌ .env.local file not found');
  console.log('   Please copy .env.example to .env.local and add your API keys');
  process.exit(1);
}

console.log('✅ .env.local file exists');

// Check for required API keys
const envContent = fs.readFileSync('.env.local', 'utf8');
const hasGoogleKey = envContent.includes('GOOGLE_API_KEY=') && !envContent.includes('your_google_api_key_here');
const hasPineconeKey = envContent.includes('PINECONE_API_KEY=') && !envContent.includes('your_pinecone_api_key_here');

if (!hasGoogleKey) {
  console.log('⚠️  Google API Key not configured in .env.local');
}

if (!hasPineconeKey) {
  console.log('⚠️  Pinecone API Key not configured in .env.local');
}

if (hasGoogleKey && hasPineconeKey) {
  console.log('✅ API Keys appear to be configured');
}

// Check build status
console.log('\n🔨 Checking build status...');
exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Build failed');
    console.error(stderr);
    return;
  }
  
  console.log('✅ Build successful');
  
  if (hasGoogleKey && hasPineconeKey) {
    console.log('\n🚀 Ready to start development server:');
    console.log('   npm run dev');
    console.log('\n📝 Next steps:');
    console.log('   1. Create your Pinecone index (dimensions: 768)');
    console.log('   2. Start the dev server');
    console.log('   3. Navigate to http://localhost:3000');
    console.log('   4. Upload some text and test the Q&A functionality');
  } else {
    console.log('\n⚠️  Complete API key setup before testing');
  }
});

console.log('\n📊 System Configuration:');
console.log('   - Chunk Size: 3,200 chars (~800 tokens)');
console.log('   - Overlap: 15%');
console.log('   - Embedding Model: text-embedding-004');
console.log('   - LLM: Gemini 1.5 Flash');
console.log('   - Vector DB: Pinecone');
console.log('   - Frontend: Next.js 15 + React + TypeScript');
