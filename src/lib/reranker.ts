import { SearchResult } from './vectorstore';

export interface RerankedResult extends SearchResult {
  rerankScore: number;
  originalScore: number;
}

export class SimpleReranker {
  /**
   * Simple keyword-based reranking
   * In a production environment, you'd use a proper reranker like Cohere Rerank
   */
  async rerank(
    query: string,
    searchResults: SearchResult[],
    topK: number = 3
  ): Promise<RerankedResult[]> {
    const queryTerms = this.extractKeywords(query.toLowerCase());
    
    const rerankedResults: RerankedResult[] = searchResults.map(result => {
      const contentTerms = this.extractKeywords(result.text.toLowerCase());
      
      // Calculate term frequency boost
      const termFrequency = this.calculateTermFrequency(queryTerms, contentTerms);
      
      // Calculate position boost (earlier chunks get slight boost)
      const positionBoost = Math.max(0.1, 1 - (result.metadata.position * 0.1));
      
      // Combine original similarity score with reranking factors
      const rerankScore = (
        result.score * 0.7 + // Original similarity (70%)
        termFrequency * 0.2 + // Term frequency (20%)
        positionBoost * 0.1   // Position boost (10%)
      );

      return {
        ...result,
        rerankScore,
        originalScore: result.score,
      };
    });

    // Sort by rerank score and return top K
    return rerankedResults
      .sort((a, b) => b.rerankScore - a.rerankScore)
      .slice(0, topK);
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - remove stop words and punctuation
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  private calculateTermFrequency(queryTerms: string[], contentTerms: string[]): number {
    if (queryTerms.length === 0) return 0;

    const contentSet = new Set(contentTerms);
    const matchingTerms = queryTerms.filter(term => contentSet.has(term));
    
    return matchingTerms.length / queryTerms.length;
  }
}

export const reranker = new SimpleReranker();
