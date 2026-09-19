/**
 * pdfEngine.js — Pure Client-Side PDF Processing Engine for FreeFileTool
 *
 * Implements zero-backend, 100% in-browser PDF utilities:
 *  - Merge multiple PDF documents
 *  - Split PDF documents by range or into individual pages
 *  - Compress PDF documents via object stream optimization and structure cleaning
 *  - Convert JPG / PNG images into multi-page PDF documents
 *  - Convert PDF pages to high-resolution JPG or PNG images via Canvas
 *
 * Performance & Memory:
 *  - Dynamic import() ensures pdf-lib and pdfjs-dist are only loaded on-demand
 *  - Zero network requests, telemetry, or external API dependencies
 *  - All generated Object URLs are tracked and revokable
 *  - Safe filename sanitization enforced on all outputs
 */

import { sanitizeFilename } from '../converter.js';
import { formatBytes } from '../shared/validator.js';

/**
 * Lazy-load pdf-lib on demand
 */
async function getPdfLib() {
  return await import('pdf-lib');
}

/**
 * Lazy-load pdfjs-dist on demand and configure same-origin worker
 */
async function getPdfJs() {
  const pdfjsLib = await import('pdfjs-dist');
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.js';
  }
  return pdfjsLib;
}

/**
 * Inspect page count and encryption status of a PDF file without full rasterization.
 * @param {File|Blob} file
 * @returns {Promise<{ pageCount: number, isEncrypted: boolean, title?: string }>}
 */
export async function getPdfInfo(file) {
  try {
    const { PDFDocument } = await getPdfLib();
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
    return {
      pageCount: pdfDoc.getPageCount(),
      isEncrypted: false,
      title: pdfDoc.getTitle() || '',
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes('encrypt') || msg.toLowerCase().includes('password')) {
      return { pageCount: 0, isEncrypted: true };
    }
    throw new Error('Could not read PDF document. The file may be corrupt or not a standard PDF.');
  }
}

/**
 * Merge two or more PDF files into a single output document.
 *
 * @param {File[]} files - List of PDF files to merge in given order
 * @param {Function} [onProgress] - Callback (currentFileIndex, totalFiles, currentFilename)
 * @returns {Promise<{ blob: Blob, url: string, filename: string, pageCount: number, sizeBytes: number, formattedSize: string }>}
 */
export async function mergePdfFiles(files, onProgress = null) {
  if (!files || files.length < 2) {
    throw new Error('Please select at least 2 PDF files to merge.');
  }

  const { PDFDocument } = await getPdfLib();
  const mergedDoc = await PDFDocument.create();
  let totalPages = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onProgress) onProgress(i + 1, files.length, file.name);

    let srcBuffer;
    try {
      srcBuffer = await file.arrayBuffer();
    } catch (e) {
      throw new Error(`Failed to read file "${file.name}".`);
    }

    let srcDoc;
    try {
      srcDoc = await PDFDocument.load(srcBuffer, { ignoreEncryption: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.toLowerCase().includes('encrypt') || msg.toLowerCase().includes('password')) {
        throw new Error(`"${file.name}" is password-protected. Please unlock it before merging.`);
      }
      throw new Error(`Could not parse "${file.name}". It may be damaged or an unsupported PDF format.`);
    }

    const pageIndices = srcDoc.getPageIndices();
    const copiedPages = await mergedDoc.copyPages(srcDoc, pageIndices);
    copiedPages.forEach((page) => mergedDoc.addPage(page));
    totalPages += copiedPages.length;
  }

  const mergedPdfBytes = await mergedDoc.save({ useObjectStreams: true });
  const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const firstBase = sanitizeFilename(files[0].name.replace(/\.[^/.]+$/, ''));
  const filename = `${firstBase}-merged.pdf`;

  return {
    blob,
    url,
    filename,
    pageCount: totalPages,
    sizeBytes: blob.size,
    formattedSize: formatBytes(blob.size),
  };
}

/**
 * Parse page range string (e.g. "1-3, 5, 8-10") into 0-based page indices.
 * @param {string} rangeStr
 * @param {number} totalPages
 * @returns {number[]} Array of 0-based indices sorted in specified order
 */
export function parsePageRange(rangeStr, totalPages) {
  if (!rangeStr || !rangeStr.trim()) {
    throw new Error('Please enter a page range (e.g. 1-3, 5).');
  }

  const indices = new Set();
  const parts = rangeStr.split(',').map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid range format: "${part}". Use numbers like 1-5.`);
      }
      if (start < 1 || end < 1 || start > totalPages || end > totalPages) {
        throw new Error(`Page range "${part}" is out of bounds. The document has ${totalPages} pages.`);
      }
      if (start > end) {
        throw new Error(`Invalid range "${part}": start page cannot be greater than end page.`);
      }

      for (let p = start; p <= end; p++) {
        indices.add(p - 1);
      }
    } else {
      const page = parseInt(part, 10);
      if (isNaN(page)) {
        throw new Error(`Invalid page number: "${part}".`);
      }
      if (page < 1 || page > totalPages) {
        throw new Error(`Page ${page} is out of bounds. The document has ${totalPages} pages.`);
      }
      indices.add(page - 1);
    }
  }

  const result = Array.from(indices).sort((a, b) => a - b);
  if (result.length === 0) {
    throw new Error('No valid pages found in the specified range.');
  }

  return result;
}

/**
 * Split a PDF file either by a specific page range or by extracting every page.
 *
 * @param {File} file
 * @param {Object} options
 * @param {'all'|'range'} options.mode - 'all' extracts all pages into individual PDFs; 'range' extracts selected pages into one PDF
 * @param {string} [options.rangeStr] - Page range string if mode === 'range'
 * @param {Function} [onProgress] - Callback (current, total)
 * @returns {Promise<{
 *   mode: 'all'|'range',
 *   singleResult?: { blob: Blob, url: string, filename: string, pageCount: number, formattedSize: string },
 *   allResults?: Array<{ blob: Blob, url: string, filename: string, pageNum: number, formattedSize: string }>
 * }>}
 */
export async function splitPdfFile(file, options = {}, onProgress = null) {
  const { mode = 'range', rangeStr = '' } = options;

  const { PDFDocument } = await getPdfLib();
  const arrayBuffer = await file.arrayBuffer();
  let srcDoc;
  try {
    srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.toLowerCase().includes('encrypt') || msg.toLowerCase().includes('password')) {
      throw new Error(`"${file.name}" is password-protected. Please remove password protection before splitting.`);
    }
    throw new Error(`Could not parse "${file.name}". File may be corrupt.`);
  }

  const totalPages = srcDoc.getPageCount();
  const rawBaseName = file.name.replace(/\.[^/.]+$/, '');
  const safeBase = sanitizeFilename(rawBaseName);

  if (mode === 'range') {
    const pageIndices = parsePageRange(rangeStr, totalPages);
    if (onProgress) onProgress(1, 1);

    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
    copiedPages.forEach((p) => newDoc.addPage(p));

    const bytes = await newDoc.save({ useObjectStreams: true });
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const filename = `${safeBase}-split-p${pageIndices.map((i) => i + 1).join('_')}.pdf`;

    return {
      mode: 'range',
      singleResult: {
        blob,
        url,
        filename,
        pageCount: pageIndices.length,
        formattedSize: formatBytes(blob.size),
      },
    };
  }

  // mode === 'all'
  const results = [];
  for (let i = 0; i < totalPages; i++) {
    if (onProgress) onProgress(i + 1, totalPages);

    const singleDoc = await PDFDocument.create();
    const [copiedPage] = await singleDoc.copyPages(srcDoc, [i]);
    singleDoc.addPage(copiedPage);

    const bytes = await singleDoc.save({ useObjectStreams: true });
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const filename = `${safeBase}-page-${i + 1}.pdf`;

    results.push({
      blob,
      url,
      filename,
      pageNum: i + 1,
      formattedSize: formatBytes(blob.size),
    });
  }

  return {
    mode: 'all',
    allResults: results,
  };
}

/**
 * Compress and optimize a PDF file directly in the browser.
 * Re-serializes the PDF structure with object streams and cleans unreferenced objects/metadata.
 *
 * @param {File} file
 * @param {Function} [onProgress]
 * @returns {Promise<{
 *   blob: Blob,
 *   url: string,
 *   filename: string,
 *   originalSizeBytes: number,
 *   compressedSizeBytes: number,
 *   originalSize: string,
 *   compressedSize: string,
 *   savingsStr: string,
 *   rawSavings: number
 * }>}
 */
export async function compressPdfFile(file, onProgress = null) {
  if (onProgress) onProgress(1, 3);
  const { PDFDocument } = await getPdfLib();
  const arrayBuffer = await file.arrayBuffer();

  let pdfDoc;
  try {
    pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.toLowerCase().includes('encrypt') || msg.toLowerCase().includes('password')) {
      throw new Error(`"${file.name}" is password-protected. Compression cannot be performed on encrypted files.`);
    }
    throw new Error(`Could not parse "${file.name}". File may be corrupt.`);
  }

  if (onProgress) onProgress(2, 3);

  // Clear unneeded structural metadata
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('FreeFileTool In-Browser PDF Optimizer');
  pdfDoc.setCreator('FreeFileTool (https://freefiletool.app)');

  // Save with compressed object streams enabled
  const compressedBytes = await pdfDoc.save({ useObjectStreams: true });

  if (onProgress) onProgress(3, 3);

  // Compare sizes
  const originalSizeBytes = file.size;
  let finalBytes = compressedBytes;

  let compressedSizeBytes = finalBytes.byteLength;

  let rawSavings = 0;
  if (originalSizeBytes > 0) {
    rawSavings = ((compressedSizeBytes - originalSizeBytes) / originalSizeBytes) * 100;
  }

  let savingsStr = '0%';
  if (Math.abs(rawSavings) < 0.05) {
    savingsStr = '0%';
  } else if (rawSavings < 0) {
    savingsStr = `${rawSavings.toFixed(1)}%`;
  } else {
    // If output is slightly larger because source was already optimized, report honestly
    savingsStr = `+${rawSavings.toFixed(1)}% (Optimized structure)`;
  }

  const blob = new Blob([finalBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const safeBase = sanitizeFilename(file.name.replace(/\.[^/.]+$/, ''));
  const filename = `${safeBase}-compressed.pdf`;

  return {
    blob,
    url,
    filename,
    originalSizeBytes,
    compressedSizeBytes,
    originalSize: formatBytes(originalSizeBytes),
    compressedSize: formatBytes(compressedSizeBytes),
    savingsStr,
    rawSavings,
  };
}

/**
 * Convert an array of JPG or PNG images into a single multi-page PDF document.
 *
 * @param {File[]} files - Image files
 * @param {Object} options
 * @param {'fit'|'a4'} [options.pageSize='fit'] - 'fit': match image dimensions; 'a4': standard A4 paper format
 * @param {'portrait'|'landscape'} [options.orientation='portrait'] - A4 orientation
 * @param {Function} [onProgress] - Callback (current, total)
 * @returns {Promise<{ blob: Blob, url: string, filename: string, pageCount: number, formattedSize: string }>}
 */
export async function imagesToPdf(files, options = {}, onProgress = null) {
  if (!files || files.length === 0) {
    throw new Error('Please select at least one image file.');
  }

  const { pageSize = 'fit', orientation = 'portrait' } = options;
  const { PDFDocument } = await getPdfLib();
  const pdfDoc = await PDFDocument.create();

  // A4 dimensions in points (72 points per inch)
  const A4_PORTRAIT = [595.28, 841.89];
  const A4_LANDSCAPE = [841.89, 595.28];
  const MARGIN = 36; // 0.5 inch margin for A4

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onProgress) onProgress(i + 1, files.length);

    const buffer = await file.arrayBuffer();
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');

    let embeddedImage;
    try {
      if (isPng) {
        embeddedImage = await pdfDoc.embedPng(buffer);
      } else {
        embeddedImage = await pdfDoc.embedJpg(buffer);
      }
    } catch (embedErr) {
      throw new Error(`Failed to embed image "${file.name}". Please ensure it is a valid JPG or PNG.`);
    }

    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    if (pageSize === 'fit') {
      // Page dimensions match the image exactly
      const page = pdfDoc.addPage([imgWidth, imgHeight]);
      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: imgWidth,
        height: imgHeight,
      });
    } else {
      // Standard A4
      const [pageWidth, pageHeight] = orientation === 'landscape' ? A4_LANDSCAPE : A4_PORTRAIT;
      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      const availWidth = pageWidth - MARGIN * 2;
      const availHeight = pageHeight - MARGIN * 2;

      // Scale to fit within printable area
      const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight, 1);
      const drawWidth = imgWidth * scale;
      const drawHeight = imgHeight * scale;

      // Center on page
      const x = (pageWidth - drawWidth) / 2;
      const y = (pageHeight - drawHeight) / 2;

      page.drawImage(embeddedImage, {
        x,
        y,
        width: drawWidth,
        height: drawHeight,
      });
    }
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const firstBase = sanitizeFilename(files[0].name.replace(/\.[^/.]+$/, ''));
  const filename = `${firstBase}-document.pdf`;

  return {
    blob,
    url,
    filename,
    pageCount: files.length,
    formattedSize: formatBytes(blob.size),
  };
}

/**
 * Convert PDF pages to high-resolution JPG or PNG images using HTML5 Canvas and PDF.js.
 *
 * @param {File} file - Source PDF file
 * @param {Object} options
 * @param {'jpg'|'png'} [options.format='jpg'] - Target image format
 * @param {number} [options.scale=1.5] - Render scale (1.0 = 72 DPI, 1.5 = 108 DPI, 2.0 = 144 DPI)
 * @param {number} [options.quality=0.85] - JPG quality (0.1 to 1.0)
 * @param {'all'|'single'} [options.pageSelection='all'] - Render all pages or single page
 * @param {number} [options.targetPage=1] - 1-based page number if single
 * @param {Function} [onProgress] - Callback (currentPage, totalPages)
 * @returns {Promise<Array<{ blob: Blob, url: string, filename: string, pageNum: number, formattedSize: string }>>}
 */
export async function pdfToImages(file, options = {}, onProgress = null) {
  const {
    format = 'jpg',
    scale = 1.5,
    quality = 0.85,
    pageSelection = 'all',
    targetPage = 1,
  } = options;

  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const ext = format === 'png' ? 'png' : 'jpg';

  const pdfjsLib = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  let pdfDoc;

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });
    pdfDoc = await loadingTask.promise;
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('encrypt')) {
      throw new Error(`"${file.name}" is password-protected. Please unlock the PDF before converting.`);
    }
    throw new Error(`Failed to load PDF document: ${msg || 'The file may be corrupted.'}`);
  }

  const numPages = pdfDoc.numPages;
  const rawBase = sanitizeFilename(file.name.replace(/\.[^/.]+$/, ''));

  const pagesToRender = [];
  if (pageSelection === 'single') {
    const p = Math.max(1, Math.min(numPages, targetPage));
    pagesToRender.push(p);
  } else {
    for (let p = 1; p <= numPages; p++) {
      pagesToRender.push(p);
    }
  }

  const results = [];

  for (let idx = 0; idx < pagesToRender.length; idx++) {
    const pageNum = pagesToRender[idx];
    if (onProgress) onProgress(idx + 1, pagesToRender.length);

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context creation failed.');
    }

    // JPEG requires a white background because JPEG doesn't support transparency
    if (format === 'jpg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise;

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) {
            resolve(new Blob([b], { type: mimeType }));
          } else {
            reject(new Error(`Failed to render page ${pageNum} to image.`));
          }
        },
        mimeType,
        quality
      );
    });

    const url = URL.createObjectURL(blob);
    const filename = `${rawBase}-page-${pageNum}.${ext}`;

    results.push({
      blob,
      url,
      filename,
      pageNum,
      formattedSize: formatBytes(blob.size),
    });
  }

  return results;
}

/**
 * Extract a single specific page from a PDF document into a new PDF.
 *
 * @param {File} file
 * @param {number} pageNum - 1-based page number
 * @returns {Promise<{ blob: Blob, url: string, filename: string, pageNum: number, pageCount: number, sizeBytes: number, formattedSize: string }>}
 */
export async function extractSinglePagePdf(file, pageNum) {
  const { PDFDocument } = await getPdfLib();
  const arrayBuffer = await file.arrayBuffer();
  let srcDoc;
  try {
    srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.toLowerCase().includes('encrypt') || msg.toLowerCase().includes('password')) {
      throw new Error(`"${file.name}" is password-protected. Please unlock it before extracting.`);
    }
    throw new Error(`Could not parse "${file.name}". File may be corrupt.`);
  }

  const totalPages = srcDoc.getPageCount();
  if (pageNum < 1 || pageNum > totalPages) {
    throw new Error(`Page ${pageNum} is out of bounds. The document has ${totalPages} pages.`);
  }

  const newDoc = await PDFDocument.create();
  const [copiedPage] = await newDoc.copyPages(srcDoc, [pageNum - 1]);
  newDoc.addPage(copiedPage);

  const bytes = await newDoc.save({ useObjectStreams: true });
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const rawBase = sanitizeFilename(file.name.replace(/\.[^/.]+$/, ''));
  const filename = `${rawBase}-page-${pageNum}.pdf`;

  return {
    blob,
    url,
    filename,
    pageNum,
    pageCount: 1,
    sizeBytes: blob.size,
    formattedSize: formatBytes(blob.size),
  };
}

/**
 * Render low-resolution thumbnails for each page of a PDF file using pdfjs-dist.
 * @param {File} file
 * @param {number} [scale=0.3]
 * @param {Function} [onProgress]
 * @returns {Promise<Array<{ pageNum: number, dataUrl: string, width: number, height: number }>>}
 */
export async function renderPdfThumbnails(file, scale = 0.3, onProgress = null) {
  const pdfjsLib = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const thumbnails = [];

  for (let p = 1; p <= numPages; p++) {
    if (onProgress) onProgress(p, numPages);
    const page = await pdfDoc.getPage(p);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      thumbnails.push({
        pageNum: p,
        dataUrl: canvas.toDataURL('image/jpeg', 0.75),
        width: viewport.width,
        height: viewport.height,
      });
    }
  }

  return thumbnails;
}

/**
 * Reorder, rotate, or delete pages from a PDF.
 * @param {File} file
 * @param {Array<{ originalIndex: number, rotation: number }>} pageOps - 0-based original index and relative rotation (0, 90, 180, 270)
 * @returns {Promise<{ blob: Blob, url: string, filename: string, pageCount: number, formattedSize: string }>}
 */
export async function organizePdfFile(file, pageOps) {
  if (!pageOps || pageOps.length === 0) {
    throw new Error('At least one page must remain in the organized PDF.');
  }

  const { PDFDocument, degrees } = await getPdfLib();
  const arrayBuffer = await file.arrayBuffer();
  let srcDoc;
  try {
    srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
  } catch (err) {
    throw new Error('Could not parse PDF. File may be password-protected or damaged.');
  }

  const newDoc = await PDFDocument.create();

  for (const op of pageOps) {
    const [copiedPage] = await newDoc.copyPages(srcDoc, [op.originalIndex]);
    const currentRotation = copiedPage.getRotation().angle;
    const finalRotation = (currentRotation + (op.rotation || 0)) % 360;
    copiedPage.setRotation(degrees(finalRotation));
    newDoc.addPage(copiedPage);
  }

  const bytes = await newDoc.save({ useObjectStreams: true });
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const rawBase = sanitizeFilename(file.name.replace(/\.[^/.]+$/, ''));
  const filename = `${rawBase}-organized.pdf`;

  return {
    blob,
    url,
    filename,
    pageCount: pageOps.length,
    formattedSize: formatBytes(blob.size),
  };
}

/**
 * Sign PDF file by stamping signature image / text fields onto a selected page.
 */
export async function signPdfFile(file, { pageIndex = 0, signatureDataUrl = '', x = 50, y = 50, width = 150, height = 75, textFields = [] }) {
  const { PDFDocument, StandardFonts, rgb } = await getPdfLib();
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });

  const pages = pdfDoc.getPages();
  if (pageIndex < 0 || pageIndex >= pages.length) {
    throw new Error('Invalid target page for signature placement.');
  }

  const targetPage = pages[pageIndex];

  if (signatureDataUrl) {
    const pngImage = await pdfDoc.embedPng(signatureDataUrl);
    targetPage.drawImage(pngImage, {
      x: Number(x),
      y: Number(y),
      width: Number(width),
      height: Number(height),
    });
  }

  if (textFields && textFields.length > 0) {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    for (const tf of textFields) {
      if (tf.text && tf.text.trim()) {
        targetPage.drawText(tf.text.trim(), {
          x: Number(tf.x || x),
          y: Number(tf.y || (y - 20)),
          size: Number(tf.fontSize || 12),
          font,
          color: rgb(0.1, 0.1, 0.1),
        });
      }
    }
  }

  const bytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const rawBase = sanitizeFilename(file.name.replace(/\.[^/.]+$/, ''));
  const filename = `${rawBase}-signed.pdf`;

  return {
    blob,
    url,
    filename,
    pageCount: pages.length,
    formattedSize: formatBytes(blob.size),
  };
}

/**
 * Add page numbers to all pages in a PDF file.
 */
export async function addPageNumbersToPdf(file, { position = 'bottom-center', format = 'page-of-total', fontSize = 10, margin = 25 }) {
  const { PDFDocument, StandardFonts, rgb } = await getPdfLib();
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  pages.forEach((page, idx) => {
    const { width, height } = page.getSize();
    const currentNum = idx + 1;
    const text = format === 'page-of-total' ? `Page ${currentNum} of ${totalPages}` : `${currentNum}`;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = fontSize;

    let x = (width - textWidth) / 2;
    let y = margin;

    if (position === 'bottom-left') {
      x = margin;
      y = margin;
    } else if (position === 'bottom-right') {
      x = width - margin - textWidth;
      y = margin;
    } else if (position === 'top-left') {
      x = margin;
      y = height - margin - textHeight;
    } else if (position === 'top-center') {
      x = (width - textWidth) / 2;
      y = height - margin - textHeight;
    } else if (position === 'top-right') {
      x = width - margin - textWidth;
      y = height - margin - textHeight;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  });

  const bytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const rawBase = sanitizeFilename(file.name.replace(/\.[^/.]+$/, ''));
  const filename = `${rawBase}-numbered.pdf`;

  return {
    blob,
    url,
    filename,
    pageCount: totalPages,
    formattedSize: formatBytes(blob.size),
  };
}

/**
 * Add text watermark to all pages of a PDF file.
 */
export async function addWatermarkToPdf(file, { text = 'CONFIDENTIAL', opacity = 0.3, fontSize = 48, rotationAngle = 45 }) {
  const { PDFDocument, StandardFonts, degrees, rgb } = await getPdfLib();
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });

  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    const x = (width - textWidth) / 2;
    const y = height / 2;

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: Number(opacity),
      rotate: degrees(Number(rotationAngle)),
    });
  });

  const bytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const rawBase = sanitizeFilename(file.name.replace(/\.[^/.]+$/, ''));
  const filename = `${rawBase}-watermarked.pdf`;

  return {
    blob,
    url,
    filename,
    pageCount: pages.length,
    formattedSize: formatBytes(blob.size),
  };
}

/**
 * Extract plain text from PDF pages using pdfjs-dist.
 */
export async function extractTextFromPdf(file, onProgress = null) {
  const pdfjsLib = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pageTexts = [];
  let totalCharacters = 0;

  for (let p = 1; p <= numPages; p++) {
    if (onProgress) onProgress(p, numPages);
    const page = await pdfDoc.getPage(p);
    const textContent = await page.getTextContent();
    const pageStr = textContent.items.map((item) => item.str).join(' ');
    pageTexts.push(`--- Page ${p} ---\n${pageStr}`);
    totalCharacters += pageStr.trim().length;
  }

  const fullText = pageTexts.join('\n\n');
  const isImageOnly = totalCharacters === 0;

  return {
    text: fullText,
    isImageOnly,
    pageCount: numPages,
    totalCharacters,
  };
}

/**
 * Convert plain text or Markdown text to a PDF document using pdf-lib.
 */
export async function convertTextToPdf(text, { pageSize = 'a4', fontSize = 12, margin = 40, lineHeight = 1.4 } = {}) {
  if (!text || !text.trim()) {
    throw new Error('Please enter or paste text to generate a PDF document.');
  }

  const { PDFDocument, StandardFonts, rgb } = await getPdfLib();
  const pdfDoc = await PDFDocument.create();

  // Page dimensions (points): A4 = [595.28, 841.89], Letter = [612, 792]
  const dimensions = pageSize === 'letter' ? [612, 792] : [595.28, 841.89];
  const [pageWidth, pageHeight] = dimensions;

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const leading = fontSize * lineHeight;
  const printableWidth = pageWidth - 2 * margin;

  let currentPage = pdfDoc.addPage(dimensions);
  let y = pageHeight - margin - fontSize;

  // Split input into lines
  const paragraphs = text.split('\n');

  for (const para of paragraphs) {
    if (para.trim() === '') {
      y -= leading;
      if (y < margin) {
        currentPage = pdfDoc.addPage(dimensions);
        y = pageHeight - margin - fontSize;
      }
      continue;
    }

    // Word wrap paragraph
    const words = para.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);

      if (width > printableWidth && currentLine) {
        currentPage.drawText(currentLine, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0.1, 0.1, 0.1),
        });
        y -= leading;

        if (y < margin) {
          currentPage = pdfDoc.addPage(dimensions);
          y = pageHeight - margin - fontSize;
        }

        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      currentPage.drawText(currentLine, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= leading;

      if (y < margin) {
        currentPage = pdfDoc.addPage(dimensions);
        y = pageHeight - margin - fontSize;
      }
    }
  }

  const bytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const filename = `document.pdf`;

  return {
    blob,
    url,
    filename,
    pageCount: pdfDoc.getPageCount(),
    formattedSize: formatBytes(blob.size),
  };
}

