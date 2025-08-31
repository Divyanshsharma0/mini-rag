'use client';

import { useState } from 'react';

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

interface QuerySectionProps {
  onResponse: (response: RAGResponse) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  documentStats: DocumentStats | null;
}

export default function QuerySection({ onResponse, isLoading, setIsLoading, documentStats }: QuerySectionProps) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a question');
      return;
    }

    if (query.trim().length < 3) {
      setError('Question must be at least 3 characters long');
      return;
    }

    if (!documentStats) {
      setError('Please index some documents first before asking questions');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          topK: 8,
          rerankTopK: 3,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process query');
      }

      onResponse(data);
      setQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        ❓ Ask a Question
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Question *
          </label>
          <input
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What would you like to know about the uploaded text?"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
            required
          />
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            {error}
          </div>
        )}

        {!documentStats && (
          <div className="text-yellow-600 dark:text-yellow-400 text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
            ⚠️ Upload and index some text first before asking questions
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !query.trim() || !documentStats}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Ask Question'
          )}
        </button>
      </form>

      {/* Sample Questions */}
      {documentStats && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            💡 Sample Questions:
          </h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setQuery("What is the main topic discussed?")}
              className="text-left text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer block"
              disabled={isLoading}
            >
              • What is the main topic discussed?
            </button>
            <button
              type="button"
              onClick={() => setQuery("Can you summarize the key points?")}
              className="text-left text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer block"
              disabled={isLoading}
            >
              • Can you summarize the key points?
            </button>
            <button
              type="button"
              onClick={() => setQuery("What are the most important details?")}
              className="text-left text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer block"
              disabled={isLoading}
            >
              • What are the most important details?
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
