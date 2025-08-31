// Dynamic imports to avoid build issues
const getPdfParse = async () => {
  const pdf = await import('pdf-parse');
  return pdf.default;
};

const getMammoth = async () => {
  const mammoth = await import('mammoth');
  return mammoth.default;
};

export interface ProcessedFile {
  text: string;
  fileName: string;
  fileType: string;
  size: number;
}

export async function processFile(file: File): Promise<ProcessedFile> {
  const fileName = file.name;
  const fileType = file.type;
  const size = file.size;

  let text = '';

  try {
    if (fileType === 'application/pdf') {
      // Process PDF
      const pdfParse = await getPdfParse();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdfParse(buffer);
      text = data.text;
      
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               fileType === 'application/msword') {
      // Process Word Document
      const mammoth = await getMammoth();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
      
    } else if (fileType.startsWith('text/')) {
      // Process Text files
      text = await file.text();
      
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    if (!text || text.trim().length < 50) {
      throw new Error('File appears to be empty or too short (minimum 50 characters required)');
    }

    return {
      text: text.trim(),
      fileName,
      fileType,
      size
    };

  } catch (error) {
    console.error('File processing error:', error);
    throw new Error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function getFileIcon(fileType: string): string {
  if (fileType === 'application/pdf') return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.startsWith('text/')) return '📃';
  if (fileType.startsWith('image/')) return '🖼️';
  return '📎';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/markdown',
  'text/csv'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
