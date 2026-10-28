/**
 * Image compressor utility for Firestore storage optimization.
 * Scales images to optimal web dimensions and compresses to JPEG/WebP.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSize: number; // in bytes
  compressedSize: number; // in bytes
  width: number;
  height: number;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export function compressImage(
  input: File | Blob | string,
  maxWidth = 1000,
  maxHeight = 700,
  quality = 0.75
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    let originalSize = 0;

    const processDataUrl = (srcDataUrl: string) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaling
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Fill white background in case of transparent png
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with chosen quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Approximate byte size of compressed base64
        const head = 'data:image/jpeg;base64,';
        const base64Content = compressedDataUrl.substring(head.length);
        const compressedSize = Math.round((base64Content.length * 3) / 4);

        resolve({
          dataUrl: compressedDataUrl,
          originalSize: originalSize || compressedSize,
          compressedSize,
          width,
          height
        });
      };

      img.onerror = (err) => {
        reject(err);
      };

      img.src = srcDataUrl;
    };

    if (typeof input === 'string') {
      originalSize = Math.round((input.length * 3) / 4);
      processDataUrl(input);
    } else {
      originalSize = input.size;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        processDataUrl(result);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(input);
    }
  });
}
