/**
 * Image compression utility using binary search quality tuning and dimension scaling.
 */
export async function compressToTargetSize(
  file: File,
  targetSizeBytes: number,
  outputFormat: 'jpg' | 'webp' = 'jpg'
): Promise<{ blob: Blob; finalSize: number; quality: number; targetReached: boolean }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context creation failed.'));
        return;
      }

      if (outputFormat === 'jpg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = outputFormat === 'webp' ? 'image/webp' : 'image/jpeg';

      let minQ = 0.05;
      let maxQ = 0.95;
      let bestBlob: Blob | null = null;
      let bestQ = 0.75;

      // 7-step binary search for quality
      for (let i = 0; i < 7; i++) {
        const midQ = (minQ + maxQ) / 2;
        const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), mimeType, midQ));

        if (blob.size <= targetSizeBytes) {
          bestBlob = blob;
          bestQ = midQ;
          minQ = midQ;
        } else {
          maxQ = midQ;
        }
      }

      // If quality reduction alone is not enough, scale down resolution
      if (!bestBlob) {
        let scale = 0.85;
        while (scale >= 0.25) {
          const scaledCanvas = document.createElement('canvas');
          scaledCanvas.width = Math.floor(width * scale);
          scaledCanvas.height = Math.floor(height * scale);
          const sctx = scaledCanvas.getContext('2d')!;
          if (outputFormat === 'jpg') {
            sctx.fillStyle = '#ffffff';
            sctx.fillRect(0, 0, scaledCanvas.width, scaledCanvas.height);
          }
          sctx.drawImage(img, 0, 0, scaledCanvas.width, scaledCanvas.height);
          const blob: Blob = await new Promise((res) => scaledCanvas.toBlob((b) => res(b!), mimeType, 0.6));
          bestBlob = blob;
          bestQ = 0.6;
          if (blob.size <= targetSizeBytes) break;
          scale -= 0.15;
        }
      }

      const finalBlob = bestBlob || file;
      const finalSize = finalBlob.size;
      const targetReached = finalSize <= targetSizeBytes;

      resolve({
        blob: finalBlob,
        finalSize,
        quality: Math.round(bestQ * 100),
        targetReached,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image file for compression.'));
    };

    img.src = objectUrl;
  });
}
