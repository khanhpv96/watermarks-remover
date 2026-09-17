/**
 * High-performance Client-Side Canvas Image Engine
 * Provides interactive Crop, Resize, AI Provenance Metadata (C2PA/EXIF) Purge, and AVIF/WebP/PNG/JPG compression.
 */

import { CameraProfileKey, injectExifToJpegBlob } from "./exifEngine";

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
  grainIntensity?: number; // 0 to 15: Analog sensor grain to remove AI plastic look & break SynthID
  microEdgeCrop?: boolean; // Auto shave 1-2px border to break steganographic grid alignment
  cameraProfile?: CameraProfileKey; // Injects realistic camera metadata into JPEG
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
  let cropX = options.cropArea?.x ?? 0;
  let cropY = options.cropArea?.y ?? 0;
  let cropW = options.cropArea?.width ?? img.naturalWidth;
  let cropH = options.cropArea?.height ?? img.naturalHeight;

  // Micro-Edge Crop: Cạo nhẹ 1-2px mép ảnh để làm lệch hệ tọa độ lưới pixel đối chiếu
  if (options.microEdgeCrop) {
    const shaveX = Math.min(2, Math.floor(cropW * 0.005));
    const shaveY = Math.min(2, Math.floor(cropH * 0.005));
    cropX += shaveX;
    cropY += shaveY;
    cropW = Math.max(10, cropW - shaveX * 2);
    cropH = Math.max(10, cropH - shaveY * 2);
  }

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

  // 4. Analog Film Grain / Sensor Noise (Luminance-aware, khử chất bóng nhựa AI & bẻ gãy SynthID)
  if (options.grainIntensity && options.grainIntensity > 0) {
    try {
      const imgData = ctx.getImageData(0, 0, finalWidth, finalHeight);
      const data = imgData.data;
      const intensity = Math.min(15, Math.max(0, options.grainIntensity));
      const maxNoise = (intensity / 100) * 255 * 0.32;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) {
          // Midtone-weighted optical grain curve
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const weight = Math.sin((Math.PI * lum) / 255);
          const noise = (Math.random() - 0.5) * 2 * maxNoise * (0.4 + 0.6 * weight);

          data[i] = Math.min(255, Math.max(0, data[i] + noise));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } catch {
      // Ignore if canvas is tainted
    }
  }

  // 5. Optional Pixel Hygiene (Disrupt imperceptible neural watermarks / SynthID pixel shifts)
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

  // 6. Convert to Blob & Inject EXIF if applicable
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (rawBlob) => {
        if (!rawBlob) {
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

        // If format is JPEG and camera profile chosen, inject realistic EXIF
        let finalBlob = rawBlob;
        if (options.format === "image/jpeg" && options.cameraProfile && options.cameraProfile !== "none") {
          try {
            finalBlob = await injectExifToJpegBlob(rawBlob, options.cameraProfile, finalWidth, finalHeight);
          } catch (err) {
            console.warn("EXIF injection warning:", err);
          }
        }

        const dataUrl = URL.createObjectURL(finalBlob);
        const saved = originalFileSize > 0 ? Math.max(0, Math.round(((originalFileSize - finalBlob.size) / originalFileSize) * 100)) : 0;

        resolve({
          blob: finalBlob,
          dataUrl,
          width: finalWidth,
          height: finalHeight,
          originalSize: originalFileSize,
          newSize: finalBlob.size,
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
