# 🚀 Deployment Guide - Mini-RAG System

## Deploying to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Pinecone account (free tier available)
- Google AI Studio account (free tier available)

### Step 1: Push to GitHub
1. Initialize git repository:
   ```bash
   git init
   git add .
   git commit -m "Initial Mini-RAG system"
   ```

2. Create a new repository on GitHub

3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/mini-rag.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Set up Pinecone
1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Create a new index:
   - **Name**: `mini-rag-index`
   - **Dimensions**: `768`
   - **Metric**: `cosine`
   - **Pod Type**: `p1.x1` (starter/free tier)
3. Copy your API key from the console

### Step 3: Get Google AI API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Copy the API key

### Step 4: Deploy on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty (default)

### Step 5: Configure Environment Variables
In your Vercel project settings, add these environment variables:

```env
GOOGLE_API_KEY=your_google_ai_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=mini-rag-index
```

### Step 6: Deploy
Click "Deploy" and wait for the build to complete.

## Post-Deployment Testing

### Test Cases
1. **Document Upload**:
   - Paste a medium-length article (1000-3000 words)
   - Verify successful indexing with chunk statistics

2. **Basic Q&A**:
   - "What is this document about?"
   - "What are the key points mentioned?"
   - "Can you summarize the main topics?"

3. **Specific Queries**:
   - Ask about specific details mentioned in the text
   - Verify citations are accurate and relevant

4. **Edge Cases**:
   - Very short text (< 50 characters) - should show error
   - Query without indexed documents - should show appropriate message

### Expected Performance
- **Document Indexing**: < 30 seconds for 5,000 words
- **Query Response**: < 5 seconds
- **Citation Accuracy**: All citations should reference actual text chunks

## Troubleshooting

### Common Issues

1. **Build Errors**:
   - Check that all environment variables are set
   - Verify Node.js version compatibility (18+)

2. **API Errors**:
   - Verify Google AI API key is valid
   - Check Pinecone index exists and API key is correct
   - Ensure Pinecone index dimensions match (768)

3. **Runtime Errors**:
   - Check Vercel function logs
   - Verify serverless function timeout limits

4. **Performance Issues**:
   - Monitor API rate limits (Google AI, Pinecone)
   - Consider chunking strategy for large documents

### Vercel Specific
- **Function Timeout**: 30 seconds on hobby plan
- **Memory Limit**: 1GB on hobby plan
- **API Routes**: All under `/api/` are serverless functions

## Scaling Considerations

### Free Tier Limits
- **Pinecone**: 1 index, 100K vectors
- **Google AI**: Rate limits apply
- **Vercel**: 100GB bandwidth, 1GB memory per function

### Production Upgrades
1. **Pinecone**: Upgrade to dedicated pods for better performance
2. **Reranking**: Integrate Cohere Rerank API
3. **Caching**: Add Redis for query result caching
4. **Authentication**: Implement user authentication
5. **File Upload**: Add support for PDF/Word documents
6. **Multi-tenancy**: Support multiple users/documents

## Monitoring

### Recommended Tools
- **Vercel Analytics**: Built-in performance monitoring
- **Uptime Monitoring**: Use services like Pingdom or UptimeRobot
- **Error Tracking**: Consider Sentry integration
- **API Monitoring**: Track API usage and costs

### Key Metrics
- **Response Time**: Target < 5 seconds for queries
- **Error Rate**: Target < 1% error rate
- **API Costs**: Monitor Google AI and Pinecone usage
- **User Satisfaction**: Citation accuracy and answer relevance

## Security

### Best Practices
- Never commit API keys to version control
- Use environment variables for all secrets
- Validate all user inputs
- Implement rate limiting for production
- Consider CORS policies for API endpoints

### Data Privacy
- User text data is stored in Pinecone (cloud)
- Consider data retention policies
- Implement data deletion capabilities
- Review third-party service privacy policies

---

**Live URL**: [Your Vercel deployment URL]
**GitHub**: [Your repository URL]

For issues or questions, refer to the main [README.md](./README.md)
