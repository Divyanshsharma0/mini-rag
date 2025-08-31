'use client';

interface Citation {
  source: string;
  position: number;
  text: string;
  relevanceScore: number;
}

interface AnswerPanelProps {
  response: {
    answer: string;
    citations: Citation[];
    metadata: {
      totalChunks: number;
      retrievedChunks: number;
      rerankedChunks: number;
      tokensUsed: number;
      model: string;
      processingTime: number;
    };
  };
}

export default function AnswerPanel({ response }: AnswerPanelProps) {
  const { answer, citations, metadata } = response;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="bg-green-50 dark:bg-green-900/20 px-6 py-4 border-b border-green-200 dark:border-green-800">
        <h2 className="text-2xl font-semibold text-green-800 dark:text-green-200 flex items-center">
          <span className="mr-2">🎯</span>
          Answer
        </h2>
      </div>

      <div className="p-6">
        {/* Main Answer */}
        <div className="mb-6">
          <div className="prose dark:prose-invert max-w-none">
            <div className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
              {answer}
            </div>
          </div>
        </div>

        {/* Citations */}
        {citations && citations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="mr-2">📚</span>
              Sources & Citations
            </h3>
            <div className="space-y-3">
              {citations.map((citation, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-indigo-500"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                      Source {index + 1}: {citation.source}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      Score: {(citation.relevanceScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    &ldquo;{citation.text}&rdquo;
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Position: {citation.position}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="mr-2">📊</span>
            Processing Details
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                Total Chunks
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {metadata.totalChunks}
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <div className="text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                Retrieved
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {metadata.retrievedChunks}
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">
                Reranked
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {metadata.rerankedChunks}
              </div>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
              <div className="text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wide">
                Time (ms)
              </div>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {metadata.processingTime}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Response Quality
              </div>
              <div className="text-lg font-bold text-green-900 dark:text-green-100">
                ✅ High Confidence
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Based on {metadata.rerankedChunks} relevant sources
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
