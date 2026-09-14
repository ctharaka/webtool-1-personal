/**
 * constants.ts — Shared Application Constants
 */

export const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50 MB
export const PDF_MIME = 'application/pdf';

export const SUPPORTED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46]; // %PDF
