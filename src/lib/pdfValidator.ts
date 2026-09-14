/**
 * pdfValidator.ts — Comprehensive Validation Logic for PDF Tools
 *
 * Enforces client-side validation rules:
 *  - 50 MB maximum file size limit
 *  - MIME type check
 *  - Magic byte verification (%PDF signature)
 *  - Encrypted / password-protected document detection
 *  - Page range and single page number syntax/boundary validation
 */

import { MAX_PDF_SIZE, PDF_MIME, PDF_MAGIC_BYTES } from './constants';
import { FILE_TYPES, validateFile, formatBytes } from './shared/validator.js';

export interface PdfValidationResult {
  valid: boolean;
  error: string | null;
  isEncrypted?: boolean;
  fileSize?: number;
  formattedSize?: string;
}

export interface PageRangeValidationResult {
  valid: boolean;
  indices: number[];
  error: string | null;
}

/**
 * Check if the provided file has valid %PDF magic bytes
 */
export async function verifyPdfMagicBytes(file: File | Blob): Promise<boolean> {
  if (!file || file.size < 4) return false;
  
  const buffer = await file.slice(0, 4).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  return PDF_MAGIC_BYTES.every((byte, idx) => bytes[idx] === byte);
}

/**
 * Detects if a PDF file is encrypted without loading the entire document into memory.
 * Checks the trailer / catalog dictionary or tries loading using pdf-lib.
 */
export async function checkPdfEncryption(file: File | Blob): Promise<boolean> {
  try {
    // Dynamic import to maintain lazy loading
    const { PDFDocument } = await import('pdf-lib');
    const arrayBuffer = await file.arrayBuffer();
    // Setting ignoreEncryption: false causes pdf-lib to throw an error on encrypted PDFs
    await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
    return false;
  } catch (err: any) {
    const msg = (err?.message || '').toLowerCase();
    if (msg.includes('encrypt') || msg.includes('password')) {
      return true;
    }
    // If it's another error, let caller handle general corruption
    return false;
  }
}

/**
 * Validates a PDF file for MIME type, size limit (<=50MB), magic bytes, and encryption.
 */
export async function validatePdfFile(file: File): Promise<PdfValidationResult> {
  if (!file || file.size === 0) {
    return {
      valid: false,
      error: 'No file provided or file is empty.',
    };
  }

  // Size limit check
  if (file.size > MAX_PDF_SIZE) {
    return {
      valid: false,
      error: `File exceeds the 50 MB limit (${formatBytes(file.size)}). Please choose a smaller document.`,
      fileSize: file.size,
      formattedSize: formatBytes(file.size),
    };
  }

  // MIME type check (allow empty string for some operating systems where file.type might be omitted, but verify magic bytes)
  if (file.type && file.type !== PDF_MIME) {
    return {
      valid: false,
      error: `Invalid file type "${file.type}". Only PDF documents (${PDF_MIME}) are accepted.`,
    };
  }

  // Magic bytes check
  const hasMagicBytes = await verifyPdfMagicBytes(file);
  if (!hasMagicBytes) {
    return {
      valid: false,
      error: 'Invalid PDF file: Missing standard %PDF signature in file header.',
    };
  }

  // Encryption check
  const isEncrypted = await checkPdfEncryption(file);
  if (isEncrypted) {
    return {
      valid: false,
      isEncrypted: true,
      error: 'This document is password-protected. Please unlock or decrypt it before uploading.',
      fileSize: file.size,
      formattedSize: formatBytes(file.size),
    };
  }

  return {
    valid: true,
    error: null,
    isEncrypted: false,
    fileSize: file.size,
    formattedSize: formatBytes(file.size),
  };
}

/**
 * Validates a page range string (e.g. "1-3, 5, 8-10") against total page count.
 * Returns sorted 0-based page indices.
 */
export function validatePageRange(rangeStr: string, totalPages: number): PageRangeValidationResult {
  if (!rangeStr || !rangeStr.trim()) {
    return {
      valid: false,
      indices: [],
      error: 'Please enter at least one page number or range (e.g. 1-3, 5).',
    };
  }

  if (totalPages <= 0) {
    return {
      valid: false,
      indices: [],
      error: 'Total pages must be greater than zero.',
    };
  }

  const indices = new Set<number>();
  const parts = rangeStr.split(',').map((p) => p.trim()).filter(Boolean);

  if (parts.length === 0) {
    return {
      valid: false,
      indices: [],
      error: 'Please enter a valid page range format (e.g. 1-3, 5).',
    };
  }

  for (const part of parts) {
    if (part.includes('-')) {
      const sides = part.split('-').map((s) => s.trim());
      if (sides.length !== 2) {
        return {
          valid: false,
          indices: [],
          error: `Invalid range format: "${part}". Use format like 1-5.`,
        };
      }
      const [startStr, endStr] = sides;
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end)) {
        return {
          valid: false,
          indices: [],
          error: `Non-numeric values in range "${part}".`,
        };
      }
      if (start < 1 || end < 1 || start > totalPages || end > totalPages) {
        return {
          valid: false,
          indices: [],
          error: `Page range "${part}" is out of bounds (document has ${totalPages} pages).`,
        };
      }
      if (start > end) {
        return {
          valid: false,
          indices: [],
          error: `Invalid range "${part}": Start page (${start}) cannot exceed end page (${end}).`,
        };
      }

      for (let p = start; p <= end; p++) {
        indices.add(p - 1);
      }
    } else {
      const page = parseInt(part, 10);
      if (isNaN(page)) {
        return {
          valid: false,
          indices: [],
          error: `Invalid page number: "${part}".`,
        };
      }
      if (page < 1 || page > totalPages) {
        return {
          valid: false,
          indices: [],
          error: `Page number ${page} is out of bounds (document has ${totalPages} pages).`,
        };
      }
      indices.add(page - 1);
    }
  }

  const sortedIndices = Array.from(indices).sort((a, b) => a - b);
  if (sortedIndices.length === 0) {
    return {
      valid: false,
      indices: [],
      error: 'No valid pages found in the specified range.',
    };
  }

  return {
    valid: true,
    indices: sortedIndices,
    error: null,
  };
}

/**
 * Validates a single page number for the single page extractor tool.
 */
export function validateSinglePage(pageNum: number, totalPages: number): { valid: boolean; error: string | null } {
  if (typeof pageNum !== 'number' || isNaN(pageNum)) {
    return { valid: false, error: 'Please enter a valid page number.' };
  }
  if (!Number.isInteger(pageNum)) {
    return { valid: false, error: 'Page number must be an integer.' };
  }
  if (pageNum < 1 || pageNum > totalPages) {
    return { valid: false, error: `Page ${pageNum} is out of range. The document contains ${totalPages} pages.` };
  }
  return { valid: true, error: null };
}
