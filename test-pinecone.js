// Quick test to verify Pinecone connection
require('dotenv').config({ path: '.env.local' });

async function testPineconeConnection() {
  console.log('🧠 Testing Mini-RAG System Connection...\n');
  
  // Check environment variables
  const googleKey = process.env.GOOGLE_API_KEY;
  const pineconeKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME;
  
  console.log('📊 Environment Check:');
  console.log(`   Google API Key: ${googleKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Pinecone API Key: ${pineconeKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Index Name: ${indexName || '❌ Missing'}`);
  
  if (!googleKey || !pineconeKey || !indexName) {
    console.log('\n❌ Please set all required environment variables in .env.local');
    return;
  }
  
  if (pineconeKey === 'your_pinecone_api_key_here') {
    console.log('\n⚠️  Please replace the Pinecone API key placeholder with your actual key');
    console.log('   1. Go to your Pinecone dashboard');
    console.log('   2. Click "API Keys" in the left sidebar');
    console.log('   3. Copy your API key');
    console.log('   4. Replace "your_pinecone_api_key_here" in .env.local');
    return;
  }
  
  try {
    // Test Pinecone connection
    const { Pinecone } = require('@pinecone-database/pinecone');
    const pinecone = new Pinecone({ apiKey: pineconeKey });
    const index = pinecone.Index(indexName);
    
    console.log('\n🔍 Testing Pinecone connection...');
    const stats = await index.describeIndexStats();
    
    console.log('✅ Pinecone connection successful!');
    console.log(`   Total vectors: ${stats.totalRecordCount || 0}`);
    console.log(`   Dimensions: ${stats.dimension}`);
    console.log(`   Index name: ${indexName}`);
    
    // Test Google AI connection
    console.log('\n🔍 Testing Google AI connection...');
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(googleKey);
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    
    const testResult = await model.embedContent('Hello world');
    console.log('✅ Google AI connection successful!');
    console.log(`   Embedding dimensions: ${testResult.embedding.values.length}`);
    
    console.log('\n🎉 All systems ready! You can now:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Open: http://localhost:3000');
    console.log('   3. Upload text and ask questions!');
    
  } catch (error) {
    console.log('\n❌ Connection test failed:');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      console.log('\n💡 This usually means your API key is incorrect.');
      console.log('   Please double-check your Pinecone API key in .env.local');
    }
  }
}

testPineconeConnection();
