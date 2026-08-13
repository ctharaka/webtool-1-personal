/**
 * converter.js — Browser-side Image Conversion Engine & Batch Processing
 *
 * Converts single or multiple image files directly in the browser using HTML5 Canvas.
 * Supports PNG, JPEG, WEBP, and AVIF formats with quality parameters and batch processing.
 *
 * Security hardening (v2):
 *  - sanitizeFilename() strips non-safe characters to prevent path-traversal and XSS via filenames
 *  - URL.revokeObjectURL() is tracked and revoked after individual downloads to prevent RAM leaks
 *  - Magic-number header validation enforced via validator.js before Canvas processing
 */

import { formatBytes } from './shared/validator.js';

export const FORMAT_MIME_MAP = Object.freeze({
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif',
});

export const FORMAT_EXT_MAP = Object.freeze({
  png: 'png',
  jpg: 'jpg',
  jpeg: 'jpg',
  webp: 'webp',
  avif: 'avif',
});

/**
 * Sanitize a filename to prevent path-traversal, XSS-via-attribute, and ZIP slip attacks.
 * Allows: letters, digits, underscores, hyphens, dots.
 * Replaces all other characters with underscores.
 *
 * @param {string} rawName - The raw filename to sanitize
 * @returns {string} A safe filename string
 */
export function sanitizeFilename(rawName) {
  if (!rawName || typeof rawName !== 'string') return 'file';
  // Replace any character that is not alphanumeric, underscore, hyphen, or dot
  return rawName.replace(/[^a-zA-Z0-9_.\-]/g, '_').replace(/\.{2,}/g, '_');
}

/**
 * Convert a single image File or Blob to a target format using HTML5 Canvas.
 *
 * @param {File|Blob} file - Source image file or blob
 * @param {string} targetFormatKey - Target format key: 'png' | 'jpg' | 'webp' | 'avif'
 * @param {number} [quality=0.8] - Quality parameter between 0.1 and 1.0
 * @returns {Promise<{
 *   blob: Blob,
 *   url: string,
 *   filename: string,
 *   convertedSize: string,
 *   originalSize: string,
 *   convertedSizeBytes: number,
 *   originalSizeBytes: number,
 *   savings: string,
 *   rawSavings: number
 * }>}
 */
export async function convertImage(file, targetFormatKey, quality = 0.8) {
  const normalizedKey = (targetFormatKey || 'webp').toLowerCase();
  const mimeType = FORMAT_MIME_MAP[normalizedKey] || `image/${normalizedKey}`;
  const ext = FORMAT_EXT_MAP[normalizedKey] || normalizedKey;

  const normalizedQuality = Math.min(1.0, Math.max(0.1, quality));

  let imageSource;
  if (typeof createImageBitmap === 'function') {
    try {
      imageSource = await createImageBitmap(file);
    } catch (e) {
      imageSource = await loadImageElement(file);
    }
  } else {
    imageSource = await loadImageElement(file);
  }

  const width = imageSource.width || imageSource.naturalWidth;
  const height = imageSource.height || imageSource.naturalHeight;

  if (!width || !height) {
    if (imageSource.close) imageSource.close();
    throw new Error('Invalid image dimensions.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    if (imageSource.close) imageSource.close();
    throw new Error('Canvas 2D context creation failed.');
  }

  // Fill white background for JPEG since JPEG does not support transparency
  if (mimeType === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(imageSource, 0, 0);

  if (imageSource.close) {
    imageSource.close();
  }

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) {
          // Explicitly enforce the exact image MIME type
          const exactBlob = new Blob([b], { type: mimeType });
          resolve(exactBlob);
        } else {
          reject(new Error(`Browser failed to export image to format: ${targetFormatKey.toUpperCase()}`));
        }
      },
      mimeType,
      normalizedQuality
    );
  });

  if (mimeType === 'image/avif' && blob.type && !blob.type.includes('avif')) {
    throw new Error('AVIF export is not supported by your current browser. Please choose WebP, PNG, or JPG.');
  }

  // ── Filename sanitization — prevents XSS-via-attribute and ZIP slip ──
  const originalFileName = file.name || 'image.png';
  const rawBaseName = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName;
  const safeBaseName = sanitizeFilename(rawBaseName);
  const filename = `${safeBaseName}.${ext}`;

  const url = URL.createObjectURL(blob);
  const originalSizeBytes = file.size;
  const convertedSizeBytes = blob.size;

  const convertedSizeStr = formatBytes(convertedSizeBytes);
  const originalSizeStr = formatBytes(originalSizeBytes);

  let rawSavings = 0;
  if (originalSizeBytes > 0) {
    rawSavings = ((convertedSizeBytes - originalSizeBytes) / originalSizeBytes) * 100;
  }

  let savingsStr = '0%';
  if (Math.abs(rawSavings) < 0.05) {
    savingsStr = '0%';
  } else if (rawSavings < 0) {
    savingsStr = `${rawSavings.toFixed(1)}%`;
  } else {
    savingsStr = `+${rawSavings.toFixed(1)}%`;
  }

  return {
    blob,
    url,
    filename,
    convertedSize: convertedSizeStr,
    originalSize: originalSizeStr,
    convertedSizeBytes,
    originalSizeBytes,
    savings: savingsStr,
    rawSavings,
  };
}

/**
 * Process a batch of files in parallel/sequence.
 *
 * @param {File[]} files
 * @param {string} targetFormatKey
 * @param {number} quality
 * @param {Function} [onItemProgress] - Callback (index, result|error)
 * @returns {Promise<{
 *   results: Array<{ file: File, result?: Object, error?: string }>,
 *   totalOriginalSize: string,
 *   totalConvertedSize: string,
 *   totalSavings: string
 * }>}
 */
export async function convertBatch(files, targetFormatKey, quality = 0.8, onItemProgress = null) {
  let totalOrigBytes = 0;
  let totalConvBytes = 0;

  const batchResults = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    totalOrigBytes += file.size;

    try {
      const res = await convertImage(file, targetFormatKey, quality);
      totalConvBytes += res.convertedSizeBytes;

      const itemResult = { file, result: res, error: null };
      batchResults.push(itemResult);

      if (onItemProgress) onItemProgress(i, itemResult);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Conversion failed.';
      const itemResult = { file, result: null, error: errMsg };
      batchResults.push(itemResult);

      if (onItemProgress) onItemProgress(i, itemResult);
    }
  }

  const totalOrigStr = formatBytes(totalOrigBytes);
  const totalConvStr = formatBytes(totalConvBytes);

  let rawSavings = 0;
  if (totalOrigBytes > 0) {
    rawSavings = ((totalConvBytes - totalOrigBytes) / totalOrigBytes) * 100;
  }

  let totalSavingsStr = '0%';
  if (Math.abs(rawSavings) < 0.05) {
    totalSavingsStr = '0%';
  } else if (rawSavings < 0) {
    totalSavingsStr = `${rawSavings.toFixed(1)}%`;
  } else {
    totalSavingsStr = `+${rawSavings.toFixed(1)}%`;
  }

  return {
    results: batchResults,
    totalOriginalSize: totalOrigStr,
    totalConvertedSize: totalConvStr,
    totalSavings: totalSavingsStr,
  };
}

/**
 * Trigger a programmatic file download and revoke the object URL after a short
 * delay (60 s) to free RAM once the browser has had time to start the download.
 *
 * @param {string} url   - Object URL returned by URL.createObjectURL()
 * @param {string} filename - Safe, sanitized download filename
 */
export function triggerDownload(url, filename) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = sanitizeFilename(filename);
  // Do NOT append to DOM — not required for modern browsers
  anchor.dispatchEvent(new MouseEvent('click', { bubbles: false, cancelable: true, view: window }));
  // Revoke after 60 seconds — browser needs time to initiate the download
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load source image into browser.'));
    };

    img.src = url;
  });
}
