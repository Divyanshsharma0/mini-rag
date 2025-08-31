'use client';

import { useState, useRef } from 'react';
// File processing constants
const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/markdown',
  'text/csv'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(fileType: string): string {
  if (fileType === 'application/pdf') return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.startsWith('text/')) return '📃';
  if (fileType.startsWith('image/')) return '🖼️';
  return '📎';
}

interface DocumentStats {
  chunksCreated: number;
  avgChunkSize: number;
  avgTokens: number;
  totalTokens: number;
  vectorsStored: number;
}

interface EnhancedUploadSectionProps {
  onDocumentIndexed: (stats: DocumentStats) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function EnhancedUploadSection({ onDocumentIndexed, isLoading, setIsLoading }: EnhancedUploadSectionProps) {
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'text' | 'file'>('text');
  const [clearPrevious, setClearPrevious] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
        setError(`Unsupported file type: ${file.type}`);
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError(`File size too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`);
        return;
      }

      setSelectedFile(file);
      setSource(file.name);
      setError('');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Upload and process file
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('source', source || selectedFile.name);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Failed to process file');
      }

      // Now embed the extracted text
      const embedResponse = await fetch('/api/embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: uploadData.text,
          source: uploadData.source,
          clearPrevious,
        }),
      });

      const embedData = await embedResponse.json();

      if (!embedResponse.ok) {
        throw new Error(embedData.error || 'Failed to index document');
      }

      setSuccess(`File processed and indexed! Created ${embedData.stats.chunksCreated} chunks.${clearPrevious ? ' Previous documents were cleared.' : ' Added to existing documents.'}`);
      onDocumentIndexed(embedData.stats);
      setSelectedFile(null);
      setSource('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Please enter some text to index');
      return;
    }

    if (text.trim().length < 50) {
      setError('Text must be at least 50 characters long');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          source: source.trim() || 'user_input',
          clearPrevious,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to index document');
      }

      setSuccess(`Document successfully indexed! Created ${data.stats.chunksCreated} chunks.${clearPrevious ? ' Previous documents were cleared.' : ' Added to existing documents.'}`);
      onDocumentIndexed(data.stats);
      setText('');
      setSource('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        📄 Upload Document
      </h2>
      
      {/* Upload Method Selector */}
      <div className="mb-4">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setUploadMethod('text')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              uploadMethod === 'text'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
            disabled={isLoading}
          >
            📝 Paste Text
          </button>
          <button
            type="button"
            onClick={() => setUploadMethod('file')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              uploadMethod === 'file'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
            disabled={isLoading}
          >
            📎 Upload File
          </button>
        </div>
      </div>

      {/* Clear Previous Documents Option */}
      <div className="mb-6 flex items-center space-x-2">
        <input
          type="checkbox"
          id="clearPrevious"
          checked={clearPrevious}
          onChange={(e) => setClearPrevious(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          disabled={isLoading}
        />
        <label htmlFor="clearPrevious" className="text-sm text-gray-700 dark:text-gray-300">
          🗑️ Clear previous documents before uploading new one
        </label>
      </div>

      {uploadMethod === 'text' ? (
        /* Text Upload Form */
        <form onSubmit={handleTextSubmit} className="space-y-4">
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Source Name (Optional)
            </label>
            <input
              type="text"
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g., 'research_paper', 'user_manual'"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Text Content *
            </label>
            <textarea
              id="text"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here... (minimum 50 characters)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white resize-y"
              disabled={isLoading}
              required
            />
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {text.length} characters
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isLoading ? 'Processing...' : 'Index Text'}
          </button>
        </form>
      ) : (
        /* File Upload Form */
        <div className="space-y-4">
          <div>
            <label htmlFor="source-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Source Name (Optional)
            </label>
            <input
              type="text"
              id="source-file"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Auto-filled from file name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
          </div>

          {/* File Drop Zone */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md,.csv"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />
            
            {selectedFile ? (
              <div className="space-y-2">
                <div className="text-2xl">{getFileIcon(selectedFile.type)}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedFile.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setSource('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                  disabled={isLoading}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-3xl text-gray-400">📁</div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                  disabled={isLoading}
                >
                  Choose file or drag and drop
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF, Word, Text files up to {formatFileSize(MAX_FILE_SIZE)}
                </p>
              </div>
            )}
          </div>

          {selectedFile && (
            <button
              type="button"
              onClick={handleFileUpload}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isLoading ? 'Processing File...' : 'Process & Index File'}
            </button>
          )}
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="mt-4 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
          {success}
        </div>
      )}
    </div>
  );
}
