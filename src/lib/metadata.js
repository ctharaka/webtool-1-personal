// src/lib/metadata.js
// Helper to strip image metadata by re-encoding via canvas.
// This drops EXIF and other metadata because canvas does not preserve it.
// Returns a new File with the same name (extension may change based on format).

/**
 * Strip metadata from an image file.
 * @param {File} file - Input image file.
 * @returns {Promise<File>} - New file without metadata.
 */
export async function stripImageMetadata(file) {
  // Load the image into an HTMLImageElement.
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  // Determine output mime type – use original if supported, else fallback to PNG.
  const originalMime = file.type;
  const supported = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];
  const mime = supported.includes(originalMime) ? originalMime : 'image/png';

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, mime);
  });

  // Cleanup temporary object URL.
  URL.revokeObjectURL(url);

  // Create a new File preserving the original name (but adjusting extension if needed).
  const extMap = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/avif': 'avif',
  };
  const newExt = extMap[mime] || 'png';
  const nameBase = file.name.replace(/\.[^.]+$/, '');
  const newName = `${nameBase}.${newExt}`;
  return new File([blob], newName, { type: mime });
}
