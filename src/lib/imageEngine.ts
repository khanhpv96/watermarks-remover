/**
 * High-performance Client-Side Canvas Image Engine
 * Provides interactive Crop, Resize, AI Provenance Metadata (C2PA/EXIF) Purge, and AVIF/WebP/PNG/JPG compression.
 */

export type ExportFormat = "image/avif" | "image/webp" | "image/png" | "image/jpeg";

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProcessImageOptions {
  cropArea?: CropArea | null;
  targetWidth?: number;
  targetHeight?: number;
  format: ExportFormat;
  quality: number; // 0.01 to 1.00
  applyPixelHygiene?: boolean; // Subtle dithering to disrupt steganographic pixel watermarks
}

export interface ProcessResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  newSize: number;
  savedPercentage: number;
  format: ExportFormat;
}

/**
 * Creates an Image element from a source file or Data URL
 */
export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = url;
  });
}

/**
 * Processes an image via pure Canvas 2D:
 * 1. Decodes raw pixel data (purging all EXIF, XMP, C2PA, and JUMB provenance blocks)
 * 2. Crops according to cropArea
 * 3. Resizes to target width/height
 * 4. Applies optional micro-noise dithering
 * 5. Re-encodes to chosen format (AVIF, WebP, PNG, JPG) with quality control
 */
export async function processImage(
  imageSource: string | HTMLImageElement,
  options: ProcessImageOptions,
  originalFileSize: number = 0
): Promise<ProcessResult> {
  const img = typeof imageSource === "string" ? await createImage(imageSource) : imageSource;

  // 1. Calculate Crop Source Coordinates
  const cropX = options.cropArea?.x ?? 0;
  const cropY = options.cropArea?.y ?? 0;
  const cropW = options.cropArea?.width ?? img.naturalWidth;
  const cropH = options.cropArea?.height ?? img.naturalHeight;

  // 2. Calculate Final Output Dimensions
  const finalWidth = Math.round(options.targetWidth && options.targetWidth > 0 ? options.targetWidth : cropW);
  const finalHeight = Math.round(options.targetHeight && options.targetHeight > 0 ? options.targetHeight : cropH);

  // 3. Create Clean Canvas
  const canvas = document.createElement("canvas");
  canvas.width = finalWidth;
  canvas.height = finalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) {
    throw new Error("Could not initialize 2D Canvas context.");
  }

  // Use high quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // If format is JPEG, draw a white background first to avoid black transparency
  if (options.format === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, finalWidth, finalHeight);
  }

  // Draw cropped and scaled image onto clean canvas
  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, finalWidth, finalHeight);

  // 4. Optional Pixel Hygiene (Disrupt imperceptible neural watermarks / SynthID pixel shifts)
  if (options.applyPixelHygiene) {
    try {
      const imgData = ctx.getImageData(0, 0, finalWidth, finalHeight);
      const data = imgData.data;
      // Inject ultra-subtle pseudo-random dither (+/- 1 LSB) to scramble steganographic keys
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) { // If not transparent
          const jitter = (Math.random() - 0.5) * 1.5;
          data[i] = Math.min(255, Math.max(0, data[i] + jitter));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + jitter));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + jitter));
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } catch {
      // Ignore if canvas is tainted
    }
  }

  // 5. Convert to Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          // Fallback if browser doesn't support target format (e.g. AVIF in older browser -> WebP)
          canvas.toBlob(
            (fallbackBlob) => {
              if (!fallbackBlob) {
                reject(new Error("Canvas export failed."));
                return;
              }
              const dataUrl = URL.createObjectURL(fallbackBlob);
              const saved = originalFileSize > 0 ? Math.max(0, Math.round(((originalFileSize - fallbackBlob.size) / originalFileSize) * 100)) : 0;
              resolve({
                blob: fallbackBlob,
                dataUrl,
                width: finalWidth,
                height: finalHeight,
                originalSize: originalFileSize,
                newSize: fallbackBlob.size,
                savedPercentage: saved,
                format: "image/webp",
              });
            },
            "image/webp",
            options.quality
          );
          return;
        }

        const dataUrl = URL.createObjectURL(blob);
        const saved = originalFileSize > 0 ? Math.max(0, Math.round(((originalFileSize - blob.size) / originalFileSize) * 100)) : 0;

        resolve({
          blob,
          dataUrl,
          width: finalWidth,
          height: finalHeight,
          originalSize: originalFileSize,
          newSize: blob.size,
          savedPercentage: saved,
          format: options.format,
        });
      },
      options.format,
      options.quality
    );
  });
}

/**
 * Converts any string (with Vietnamese accents, spaces, special chars) into a clean URL/filename-friendly slug.
 * Example: "Ảnh gốc đẹp" -> "anh-goc-dep"
 */
export function slugifyFileName(str: string): string {
  if (!str || !str.trim()) return "image-clean";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric chars with -
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
}

/**
 * Format bytes to human readable format (KB, MB)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
