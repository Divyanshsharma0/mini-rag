'use client';

interface DocumentStats {
  chunksCreated: number;
  avgChunkSize: number;
  avgTokens: number;
  totalTokens: number;
  vectorsStored: number;
}

interface StatsPanelProps {
  documentStats: DocumentStats | null;
}

export default function StatsPanel({ documentStats }: StatsPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <span className="mr-2">📈</span>
        System Stats
      </h2>

      {documentStats ? (
        <div className="space-y-4">
          {/* Document Overview */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              📄 Document Processing
            </h3>
            <div className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  Chunks Created
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {documentStats.chunksCreated}
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                  Vectors Stored
                </div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {documentStats.vectorsStored}
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                  Total Tokens
                </div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {documentStats.totalTokens.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Chunking Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              ✂️ Chunking Details
            </h3>
            <div className="space-y-3">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <div className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                  Avg Chunk Size
                </div>
                <div className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                  {documentStats.avgChunkSize} chars
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                <div className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                  Avg Tokens/Chunk
                </div>
                <div className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                  {documentStats.avgTokens}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              💡 Tips
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm space-y-2">
              <div className="text-gray-700 dark:text-gray-300">
                • Upload longer texts for better results
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                • Ask specific questions about your content
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                • Check the citations for source references
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                • Try follow-up questions for more details
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">📊</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Upload and index a document to see processing statistics
          </p>
        </div>
      )}
    </div>
  );
}
