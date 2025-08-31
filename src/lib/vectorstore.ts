import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import { TextChunk } from './chunking';
import { generateEmbedding } from './embeddings';

if (!process.env.PINECONE_API_KEY) {
  throw new Error('PINECONE_API_KEY is not set');
}

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error('PINECONE_INDEX_NAME is not set');
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const indexName = process.env.PINECONE_INDEX_NAME;

export interface VectorDocument {
  id: string;
  text: string;
  metadata: {
    source: string;
    position: number;
    startChar: number;
    endChar: number;
    chunkSize: number;
    timestamp: number;
  };
}

export interface SearchResult extends VectorDocument {
  score: number;
}

export class VectorStore {
  private index;

  constructor() {
    this.index = pinecone.Index(indexName);
  }

  async storeDocuments(chunks: TextChunk[]): Promise<string[]> {
    const vectors: PineconeRecord[] = [];
    const documentIds: string[] = [];

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.text);
      const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      vectors.push({
        id,
        values: embedding,
        metadata: {
          text: chunk.text,
          source: chunk.metadata.source,
          position: chunk.metadata.position,
          startChar: chunk.metadata.startChar,
          endChar: chunk.metadata.endChar,
          chunkSize: chunk.metadata.chunkSize,
          timestamp: Date.now(),
        },
      });

      documentIds.push(id);
    }

    await this.index.upsert(vectors);
    return documentIds;
  }

  async similaritySearch(
    query: string,
    topK: number = 5
  ): Promise<SearchResult[]> {
    const queryEmbedding = await generateEmbedding(query);

    const searchResponse = await this.index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    const results: SearchResult[] = searchResponse.matches?.map(match => ({
      id: match.id,
      text: match.metadata?.text as string,
      score: match.score || 0,
      metadata: {
        source: match.metadata?.source as string,
        position: match.metadata?.position as number,
        startChar: match.metadata?.startChar as number,
        endChar: match.metadata?.endChar as number,
        chunkSize: match.metadata?.chunkSize as number,
        timestamp: match.metadata?.timestamp as number,
      },
    })) || [];

    return results;
  }

  async deleteAll(): Promise<void> {
    await this.index.deleteAll();
  }

  async getStats() {
    const stats = await this.index.describeIndexStats();
    return {
      totalVectors: stats.totalRecordCount,
      dimension: stats.dimension,
      indexFullness: stats.indexFullness,
    };
  }
}

// Singleton instance
export const vectorStore = new VectorStore();
