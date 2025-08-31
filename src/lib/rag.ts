import { chunkText, getChunkingStats, DEFAULT_CHUNKING_CONFIG } from './chunking';
import { vectorStore } from './vectorstore';
import { reranker } from './reranker';
import { llmService } from './llm';

export interface RAGResponse {
  answer: string;
  citations: Array<{
    source: string;
    position: number;
    text: string;
    relevanceScore: number;
  }>;
  metadata: {
    totalChunks: number;
    retrievedChunks: number;
    rerankedChunks: number;
    tokensUsed: number;
    model: string;
    processingTime: number;
  };
}

export interface DocumentStats {
  chunksCreated: number;
  avgChunkSize: number;
  avgTokens: number;
  totalTokens: number;
  vectorsStored: number;
}

export class RAGService {
  async indexDocument(text: string, source: string = 'user_input'): Promise<DocumentStats> {
    const startTime = Date.now();
    
    // Step 1: Chunk the text
    const chunks = chunkText(text, source, DEFAULT_CHUNKING_CONFIG);
    const chunkStats = getChunkingStats(chunks);
    
    if (!chunkStats || chunks.length === 0) {
      throw new Error('No valid chunks created from the provided text');
    }
    
    // Step 2: Store in vector database
    const documentIds = await vectorStore.storeDocuments(chunks);
    
    const endTime = Date.now();
    console.log(`Document indexed in ${endTime - startTime}ms`);
    
    return {
      chunksCreated: chunks.length,
      avgChunkSize: chunkStats.avgChunkSize,
      avgTokens: chunkStats.avgTokens,
      totalTokens: chunkStats.totalTokens,
      vectorsStored: documentIds.length,
    };
  }

  async query(question: string, topK: number = 8, rerankTopK: number = 3): Promise<RAGResponse> {
    const startTime = Date.now();
    
    try {
      // Step 1: Retrieve relevant chunks from vector store
      const searchResults = await vectorStore.similaritySearch(question, topK);
      
      if (searchResults.length === 0) {
        return {
          answer: "I don't have enough information to answer your question. Please provide some relevant context first.",
          citations: [],
          metadata: {
            totalChunks: 0,
            retrievedChunks: 0,
            rerankedChunks: 0,
            tokensUsed: 0,
            model: 'none',
            processingTime: Date.now() - startTime,
          },
        };
      }

      // Step 2: Rerank the results
      const rerankedResults = await reranker.rerank(question, searchResults, rerankTopK);

      // Step 3: Generate answer using LLM
      const generatedAnswer = await llmService.generateAnswer(question, rerankedResults);

      const endTime = Date.now();
      
      return {
        answer: generatedAnswer.answer,
        citations: generatedAnswer.citations,
        metadata: {
          totalChunks: await this.getTotalVectors(),
          retrievedChunks: searchResults.length,
          rerankedChunks: rerankedResults.length,
          tokensUsed: generatedAnswer.tokensUsed,
          model: generatedAnswer.model,
          processingTime: endTime - startTime,
        },
      };
    } catch (error) {
      console.error('Error in RAG query:', error);
      throw new Error(`Failed to process query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getVectorStoreStats() {
    return await vectorStore.getStats();
  }

  async clearVectorStore() {
    await vectorStore.deleteAll();
  }

  private async getTotalVectors(): Promise<number> {
    try {
      const stats = await vectorStore.getStats();
      return stats.totalVectors || 0;
    } catch (error) {
      console.error('Error getting vector count:', error);
      return 0;
    }
  }
}

export const ragService = new RAGService();
