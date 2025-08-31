# Mini RAG System

Implementation of a retrieval-augmented generation pipeline using Next.js, Pinecone vector database, and Google's Gemini models.

## Architecture

**Document Indexing Pipeline:**
```
Text Input → Chunking (3.2k chars, 15% overlap) → Embeddings (text-embedding-004) → Pinecone Storage
```

**Query Pipeline:**
```
User Query → Vector Search (top-8) → Keyword Reranking (top-3) → Context Assembly → LLM Generation
```

## Implementation Details

### Text Processing
- **Chunking Strategy**: Fixed 3,200 character chunks with 15% overlap to maintain context boundaries
- **Overlap Calculation**: `overlapSize = chunkSize * 0.15`, `stepSize = chunkSize - overlapSize`
- **Minimum Threshold**: Chunks under 50 characters are filtered out

### Vector Operations
- **Embedding Model**: Google's text-embedding-004 (768 dimensions)
- **Vector Storage**: Pinecone with cosine similarity
- **Search**: Top-K retrieval with configurable K (default: 8)

### Reranking Algorithm
Simple keyword-based scoring that combines:
- **Semantic similarity**: 70% weight from original vector score
- **Term frequency**: 20% weight from query-content keyword overlap
- **Position bias**: 10% weight favoring earlier document chunks

### LLM Integration
- **Model**: Gemini 2.0 Flash Experimental
- **Context Assembly**: Concatenated reranked chunks with source labels
- **Generation**: Temperature 0.3, max 1024 output tokens
- **Citation Extraction**: Maps back to original chunk metadata

## Core Services

- **RAGService**: Orchestrates indexing and query workflows
- **VectorStore**: Pinecone integration with CRUD operations
- **SimpleReranker**: Keyword-based relevance scoring
- **LLMService**: Gemini integration with prompt engineering
- **ChunkingService**: Text segmentation with overlap handling

## API Design

**POST /api/embed**
- Processes text input through chunking → embedding → storage pipeline
- Returns indexing statistics (chunk count, token estimates, storage metrics)
- Supports optional vector store clearing

**POST /api/query** 
- Executes retrieval → reranking → generation pipeline
- Returns answers with citations, relevance scores, and processing metadata
- Configurable topK and rerankTopK parameters

## Technical Considerations

**Rate Limiting**: Free tier constraints (15 RPM for Gemini 2.0 Flash)
**Vector Dimensions**: 768-dimensional embeddings from text-embedding-004
**Chunking Trade-offs**: Character-based splitting vs semantic boundaries
**Reranking**: Simple keyword matching vs neural rerankers
