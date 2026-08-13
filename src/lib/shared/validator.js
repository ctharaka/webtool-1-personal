/**
 * validator.js — Magic-number file validation for FreeFileTools
 *
 * Validates files by reading the first bytes and comparing against
 * known binary signatures. Never trusts the file extension alone.
 */

/**
 * Supported file-type definitions.
 * Each entry maps a type key to its magic-number signature,
 * expected MIME type, human-readable label, and default max size.
 */
export const FILE_TYPES = Object.freeze({
  pdf: {
    label: 'PDF',
    mime: 'application/pdf',
    maxBytes: 50 * 1024 * 1024, // 50 MB
    /** %PDF → 0x25 0x50 0x44 0x46 */
    magic: [0x25, 0x50, 0x44, 0x46],
    magicOffset: 0,
  },
  png: {
    label: 'PNG',
    mime: 'image/png',
    maxBytes: 50 * 1024 * 1024, // 50 MB
    /** PNG header → 0x89 0x50 0x4E 0x47 */
    magic: [0x89, 0x50, 0x4e, 0x47],
    magicOffset: 0,
  },
  jpg: {
    label: 'JPG',
    mime: 'image/jpeg',
    maxBytes: 50 * 1024 * 1024, // 50 MB
    /** JPEG SOI → 0xFF 0xD8 0xFF */
    magic: [0xff, 0xd8, 0xff],
    magicOffset: 0,
  },
  webp: {
    label: 'WebP',
    mime: 'image/webp',
    maxBytes: 50 * 1024 * 1024, // 50 MB
    /** RIFF header → 0x52 0x49 0x46 0x46 (full WebP also has "WEBP" at offset 8) */
    magic: [0x52, 0x49, 0x46, 0x46],
    magicOffset: 0,
    /** Secondary signature at offset 8: "WEBP" → 0x57 0x45 0x42 0x50 */
    magic2: [0x57, 0x45, 0x42, 0x50],
    magic2Offset: 8,
  },
});

/**
 * Read the first `n` bytes from a File/Blob.
 * @param {File} file
 * @param {number} n
 * @returns {Promise<Uint8Array>}
 */
function readHeader(file, n) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = () => reject(new Error('Failed to read file header.'));
    reader.readAsArrayBuffer(file.slice(0, n));
  });
}

/**
 * Check whether `header` bytes match a magic-number signature
 * at a given offset.
 * @param {Uint8Array} header
 * @param {number[]}   magic
 * @param {number}     offset
 * @returns {boolean}
 */
function matchesMagic(header, magic, offset) {
  if (header.length < offset + magic.length) return false;
  return magic.every((byte, i) => header[offset + i] === byte);
}

/**
 * @typedef {Object} ValidationResult
 * @property {boolean}      valid      – true if the file passed all checks
 * @property {string|null}  typeKey    – matched type key (e.g. "pdf") or null
 * @property {string|null}  label      – human-readable label (e.g. "PDF")
 * @property {string|null}  mime       – canonical MIME type
 * @property {string|null}  error      – error message when invalid
 */

/**
 * Validate a file against allowed types and size constraints.
 *
 * @param {File}      file
 * @param {Object}    [options]
 * @param {string[]}  [options.allowedTypes]  – subset of keys from FILE_TYPES (defaults to all)
 * @param {Record<string,number>} [options.maxSizeOverrides] – per-type max-byte overrides
 * @returns {Promise<ValidationResult>}
 */
export async function validateFile(file, options = {}) {
  const {
    allowedTypes = Object.keys(FILE_TYPES),
    maxSizeOverrides = {},
  } = options;

  // ── Guard: empty or missing file ──────────────────────────
  if (!file || file.size === 0) {
    return { valid: false, typeKey: null, label: null, mime: null, error: 'No file provided or file is empty.' };
  }

  // ── Read enough bytes for the deepest magic check ─────────
  const maxReadBytes = 12; // covers RIFF + "WEBP" at offset 8
  const header = await readHeader(file, maxReadBytes);

  // ── Match against every allowed type ──────────────────────
  for (const key of allowedTypes) {
    const def = FILE_TYPES[key];
    if (!def) continue;

    const primaryMatch = matchesMagic(header, def.magic, def.magicOffset);
    if (!primaryMatch) continue;

    // Optional secondary magic (e.g. WebP needs "WEBP" at offset 8)
    if (def.magic2) {
      const secondaryMatch = matchesMagic(header, def.magic2, def.magic2Offset);
      if (!secondaryMatch) continue;
    }

    // ── Size check ──────────────────────────────────────────
    const maxBytes = maxSizeOverrides[key] ?? def.maxBytes;
    if (file.size > maxBytes) {
      const maxMB = (maxBytes / (1024 * 1024)).toFixed(0);
      const fileMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        typeKey: key,
        label: def.label,
        mime: def.mime,
        error: `File is too large (${fileMB} MB). Maximum for ${def.label} is ${maxMB} MB.`,
      };
    }

    return { valid: true, typeKey: key, label: def.label, mime: def.mime, error: null };
  }

  // ── No magic match found ──────────────────────────────────
  const allowedLabels = allowedTypes.map((k) => FILE_TYPES[k]?.label).filter(Boolean).join(', ');
  return {
    valid: false,
    typeKey: null,
    label: null,
    mime: null,
    error: `Unsupported file type. Allowed types: ${allowedLabels}.`,
  };
}

/**
 * Format a byte count as a human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
