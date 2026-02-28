/**
 * Document Text Extraction Utilities
 * Helper functions to extract text from various document formats
 */

/**
 * Extract text from a File object
 * Currently supports: TXT, basic text extraction
 * For production, consider using libraries like:
 * - pdf.js for PDFs
 * - mammoth.js for DOCX
 * - tesseract.js for OCR on images
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  // Text files
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await readTextFile(file);
  }

  // For other formats, return a placeholder
  // In production, implement proper extraction
  if (fileName.endsWith('.pdf')) {
    return `[PDF Document: ${file.name}]\nNote: PDF text extraction not yet implemented. Please install pdf.js library.`;
  }

  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    return `[Word Document: ${file.name}]\nNote: DOCX text extraction not yet implemented. Please install mammoth.js library.`;
  }

  if (fileType.startsWith('image/')) {
    return `[Image: ${file.name}]\nNote: OCR not yet implemented. Please install tesseract.js library.`;
  }

  return `[Unsupported file type: ${file.name}]`;
}

/**
 * Read text from a text file
 */
async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Extract text from multiple files
 */
export async function extractTextFromFiles(files: File[]): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  for (const file of files) {
    try {
      const text = await extractTextFromFile(file);
      results.set(file.name, text);
    } catch (error) {
      console.error(`Failed to extract text from ${file.name}:`, error);
      results.set(file.name, `[Error extracting text from ${file.name}]`);
    }
  }
  
  return results;
}

/**
 * Validate file for AI processing
 */
export function validateFileForAI(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  const isAllowedType = allowedTypes.includes(file.type) || 
    file.name.match(/\.(txt|pdf|doc|docx|jpg|jpeg|png)$/i);

  if (!isAllowedType) {
    return { valid: false, error: 'File type not supported' };
  }

  return { valid: true };
}

/**
 * Prepare document text for AI analysis
 * Cleans and formats text for better AI processing
 */
export function prepareTextForAI(text: string, maxLength: number = 10000): string {
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Truncate if too long (keep first part which usually has key info)
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength) + '...[truncated]';
  }
  
  return cleaned;
}

/**
 * Installation guide for document processing libraries
 */
export const DOCUMENT_PROCESSING_GUIDE = {
  pdf: {
    library: 'pdfjs-dist',
    install: 'npm install pdfjs-dist',
    docs: 'https://mozilla.github.io/pdf.js/',
  },
  docx: {
    library: 'mammoth',
    install: 'npm install mammoth',
    docs: 'https://github.com/mwilliamson/mammoth.js',
  },
  ocr: {
    library: 'tesseract.js',
    install: 'npm install tesseract.js',
    docs: 'https://tesseract.projectnaptha.com/',
  },
};
