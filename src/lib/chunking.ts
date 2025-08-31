export interface TextChunk {
  text: string;
  metadata: {
    source: string;
    position: number;
    startChar: number;
    endChar: number;
    chunkSize: number;
  };
}

export interface ChunkingConfig {
  chunkSize: number; // in characters (roughly 3-4 chars per token)
  overlap: number; // overlap percentage (e.g., 0.15 for 15%)
}

// Default configuration: ~800-1200 tokens with 15% overlap
export const DEFAULT_CHUNKING_CONFIG: ChunkingConfig = {
  chunkSize: 3200, // ~800 tokens
  overlap: 0.15
};

export function chunkText(
  text: string, 
  source: string = 'user_input',
  config: ChunkingConfig = DEFAULT_CHUNKING_CONFIG
): TextChunk[] {
  const { chunkSize, overlap } = config;
  const overlapSize = Math.floor(chunkSize * overlap);
  const stepSize = chunkSize - overlapSize;
  
  const chunks: TextChunk[] = [];
  let position = 0;
  
  for (let i = 0; i < text.length; i += stepSize) {
    const start = i;
    const end = Math.min(i + chunkSize, text.length);
    const chunkText = text.slice(start, end);
    
    // Skip very small chunks at the end
    if (chunkText.trim().length < 50) {
      break;
    }
    
    chunks.push({
      text: chunkText.trim(),
      metadata: {
        source,
        position,
        startChar: start,
        endChar: end,
        chunkSize: chunkText.length
      }
    });
    
    position++;
    
    // Break if we've reached the end
    if (end >= text.length) {
      break;
    }
  }
  
  return chunks;
}

export function estimateTokens(text: string): number {
  // Rough estimation: ~3.5 characters per token for English text
  return Math.ceil(text.length / 3.5);
}

export function getChunkingStats(chunks: TextChunk[]) {
  if (chunks.length === 0) return null;
  
  const chunkSizes = chunks.map(chunk => chunk.text.length);
  const tokenCounts = chunks.map(chunk => estimateTokens(chunk.text));
  
  return {
    totalChunks: chunks.length,
    avgChunkSize: Math.round(chunkSizes.reduce((a, b) => a + b, 0) / chunks.length),
    avgTokens: Math.round(tokenCounts.reduce((a, b) => a + b, 0) / chunks.length),
    minChunkSize: Math.min(...chunkSizes),
    maxChunkSize: Math.max(...chunkSizes),
    totalTokens: tokenCounts.reduce((a, b) => a + b, 0)
  };
}
