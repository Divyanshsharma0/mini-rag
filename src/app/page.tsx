'use client';

import { useState, useEffect, useRef } from 'react';
import EnhancedUploadSection from '@/components/EnhancedUploadSection';
import QuerySection from '@/components/QuerySection';
import AnswerPanel from '@/components/AnswerPanel';
import StatsPanel from '@/components/StatsPanel';

interface DocumentStats {
  chunksCreated: number;
  avgChunkSize: number;
  avgTokens: number;
  totalTokens: number;
  vectorsStored: number;
}

interface RAGResponse {
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

export default function Home() {
  const [documentStats, setDocumentStats] = useState<DocumentStats | null>(null);
  const [ragResponse, setRagResponse] = useState<RAGResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to answer when it's generated
  useEffect(() => {
    if (ragResponse && answerRef.current) {
      answerRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [ragResponse]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🧠 Mini-RAG System
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload text, ask questions, get AI-powered answers with citations
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Upload & Query */}
          <div className="lg:col-span-2 space-y-6">
            <EnhancedUploadSection 
              onDocumentIndexed={setDocumentStats}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
            
            <QuerySection 
              onResponse={setRagResponse}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              documentStats={documentStats}
            />
          </div>

          {/* Right Column: Stats */}
          <div>
            <StatsPanel documentStats={documentStats} />
          </div>
        </div>

        {/* Answer Panel */}
        {ragResponse && (
          <div className="mt-8" ref={answerRef}>
            <AnswerPanel response={ragResponse} />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Built with Next.js, Pinecone, and Google Gemini</p>
        </footer>
      </div>
    </div>
  );
}
