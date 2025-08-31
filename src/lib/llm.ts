import { GoogleGenerativeAI } from '@google/generative-ai';
import { RerankedResult } from './reranker';

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export interface GeneratedAnswer {
  answer: string;
  citations: Citation[];
  tokensUsed: number;
  model: string;
}

export interface Citation {
  source: string;
  position: number;
  text: string;
  relevanceScore: number;
}

export class LLMService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 1024,
      }
    });
  }

  async generateAnswer(
    query: string,
    context: RerankedResult[]
  ): Promise<GeneratedAnswer> {
    const contextText = this.buildContext(context);
    const prompt = this.buildPrompt(query, contextText);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const answer = response.text();

      // Extract citations from the context
      const citations: Citation[] = context.map((item) => ({
        source: item.metadata.source,
        position: item.metadata.position,
        text: item.text.substring(0, 150) + '...',
        relevanceScore: item.rerankScore
      }));

      return {
        answer,
        citations,
        tokensUsed: this.estimateTokens(prompt + answer),
        model: 'gemini-2.0-flash-exp'
      };
    } catch (error) {
      console.error('Error generating answer:', error);
      throw new Error('Failed to generate answer');
    }
  }

  private buildContext(context: RerankedResult[]): string {
    return context
      .map((item, index) => 
        `[Source ${index + 1}]: ${item.text}`
      )
      .join('\n\n');
  }

  private buildPrompt(query: string, context: string): string {
    return `You are a helpful AI assistant. Answer the user's question based on the provided context. 

**Important Instructions:**
1. Answer only based on the provided context
2. If the context doesn't contain enough information, say so
3. Be precise and concise
4. Reference the sources when possible
5. If multiple sources support your answer, mention them

**Context:**
${context}

**Question:** ${query}

**Answer:**`;
  }

  private estimateTokens(text: string): number {
    // Rough estimation for Gemini models
    return Math.ceil(text.length / 4);
  }
}

export const llmService = new LLMService();
