"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { Area } from "react-easy-crop";
import {
  Upload,
  ClipboardPaste,
  Download,
  RotateCw,
  Sparkles,
  Maximize2,
  Crop,
  Shield,
  FileEdit,
  Camera,
  Sliders,
} from "lucide-react";
import { AspectRatioType } from "./CropPresets";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { CropModal } from "./CropModal";
import { ResizeModal } from "./ResizeModal";
import {
  processImage,
  formatBytes,
  slugifyFileName,
  ExportFormat,
  ProcessResult,
} from "@/lib/imageEngine";
import { CameraProfileKey, CAMERA_PROFILES } from "@/lib/exifEngine";

export function ImageStudio() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<{ name: string; size: number; width: number; height: number } | null>(null);
  const [customFileName, setCustomFileName] = useState<string>("");
  
  // Crop state
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [cropAspectType, setCropAspectType] = useState<AspectRatioType>("free");
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);

  // Resize state
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [isResizeModalOpen, setIsResizeModalOpen] = useState<boolean>(false);

  // Export settings
  const [exportFormat, setExportFormat] = useState<ExportFormat>("image/jpeg");
  const [quality, setQuality] = useState<number>(90);
  const [applyPixelHygiene, setApplyPixelHygiene] = useState<boolean>(true);

  // AI Cloaking settings
  const [grainIntensity, setGrainIntensity] = useState<number>(3); // 3% default natural grain
  const [cameraProfile, setCameraProfile] = useState<CameraProfileKey>("sony-a7iv");
  const [microEdgeCrop, setMicroEdgeCrop] = useState<boolean>(true);

  // Processing & result state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedResult, setProcessedResult] = useState<ProcessResult | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to load image file
  const handleLoadImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp ảnh hợp lệ.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const img = new Image();
      img.onload = () => {
        setImageSrc(result);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setOriginalFile({
          name: file.name,
          size: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
        setCustomFileName(nameWithoutExt);
        setTargetWidth(img.naturalWidth);
        setTargetHeight(img.naturalHeight);
        setCroppedAreaPixels(null);
        setCropAspectType("free");
        setProcessedResult(null);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }, []);

  // Global Clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith("image/")) {
          e.preventDefault();
          handleLoadImageFile(file);
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleLoadImageFile]);

  const handleApplyCrop = (area: Area | null, aspect: AspectRatioType) => {
    setCroppedAreaPixels(area);
    setCropAspectType(aspect);
    if (area) {
      setTargetWidth(area.width);
      setTargetHeight(area.height);
    }
  };

  const handleApplyResize = (w: number, h: number) => {
    setTargetWidth(w);
    setTargetHeight(h);
  };

  const handleProcess = async () => {
    if (!imageSrc || !originalFile) return;
    setIsProcessing(true);

    try {
      const result = await processImage(
        imageSrc,
        {
          cropArea: croppedAreaPixels,
          targetWidth: targetWidth > 0 ? targetWidth : undefined,
          targetHeight: targetHeight > 0 ? targetHeight : undefined,
          format: exportFormat,
          quality: quality / 100,
          applyPixelHygiene,
          grainIntensity,
          microEdgeCrop,
          cameraProfile,
        },
        originalFile.size
      );

      setProcessedResult(result);
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi trong quá trình xử lý ảnh.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Get current extension string
  const getExtension = (format: ExportFormat) => {
    if (format === "image/avif") return "avif";
    if (format === "image/png") return "png";
    if (format === "image/jpeg") return "jpg";
    return "webp";
  };

  const handleDownload = () => {
    if (!processedResult) return;
    const a = document.createElement("a");
    a.href = processedResult.dataUrl;

    const slugName = slugifyFileName(customFileName || originalFile?.name.replace(/\.[^/.]+$/, "") || "image");
    const ext = getExtension(processedResult.format);

    a.download = `${slugName}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const currentExt = getExtension(exportFormat);
  const previewCleanName = `${slugifyFileName(customFileName || "image")}.${currentExt}`;

  return (
    <div className="space-y-4">
      {/* Compact Dropzone */}
      {!imageSrc ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingOver(false);
            if (e.dataTransfer.files.length > 0) {
              handleLoadImageFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all bg-white shadow-xs ${
            isDraggingOver
              ? "border-zinc-900 bg-zinc-50 scale-[0.99]"
              : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50/50"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleLoadImageFile(e.target.files[0]);
              }
            }}
            accept="image/*"
            className="hidden"
          />

          <div className="mx-auto w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800 mb-3 border border-zinc-200">
            <Upload className="h-5 w-5" />
          </div>

          <p className="text-sm font-semibold text-zinc-900 mb-1">
            Chọn ảnh hoặc kéo thả vào đây
          </p>
          <p className="text-xs text-zinc-400 mb-3">
            Hỗ trợ PNG, JPG, WebP, AVIF &middot; Tự động xóa C2PA, EXIF
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium border border-zinc-200/80">
            <ClipboardPaste className="h-3 w-3 text-zinc-500" />
            <span>Hoặc nhấn <kbd className="px-1.5 py-0.5 bg-white border border-zinc-300 rounded text-[11px] font-mono shadow-xs">Ctrl + V</kbd> để dán ảnh</span>
          </div>
        </div>
      ) : (
        /* Streamlined Clean Layout with Equal Height Panels */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Main Visual Image Card (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col h-full">
            <div className="bg-white rounded-xl border border-zinc-200 p-3.5 shadow-xs flex flex-col h-full justify-between gap-3">
              {/* Header with image info */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-100 shrink-0">
                <div className="flex items-center gap-2 text-xs truncate">
                  <span className="font-semibold text-zinc-900 truncate max-w-[200px]">
                    {originalFile?.name}
                  </span>
                  <span className="text-zinc-400">
                    ({originalFile?.width}x{originalFile?.height}px &middot; {formatBytes(originalFile?.size || 0)})
                  </span>
                </div>

                <button
                  onClick={() => {
                    setImageSrc(null);
                    setProcessedResult(null);
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-900 px-2 py-0.5 rounded hover:bg-zinc-100 transition-colors"
                >
                  Đổi ảnh
                </button>
              </div>

              {/* Image Preview / Slider (Stretches to fill available height) */}
              <div className="relative w-full flex-1 min-h-[380px] rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 flex items-center justify-center">
                {processedResult ? (
                  <BeforeAfterSlider
                    originalUrl={imageSrc}
                    processedUrl={processedResult.dataUrl}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-3">
                    <img
                      src={imageSrc}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain rounded-md"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons to trigger Crop and Resize Modals */}
              <div className="flex items-center justify-between gap-2 pt-1 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCropModalOpen(true)}
                    className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all flex items-center gap-1.5 shadow-xs ${
                      croppedAreaPixels
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <Crop className="h-3.5 w-3.5" />
                    <span>Cắt ảnh</span>
                    {croppedAreaPixels && (
                      <span className="px-1.5 py-0.2 bg-zinc-700 text-[10px] rounded-full">
                        {cropAspectType}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsResizeModalOpen(true)}
                    className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all flex items-center gap-1.5 shadow-xs ${
                      targetWidth !== originalFile?.width || targetHeight !== originalFile?.height
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Resize</span>
                    {(targetWidth !== originalFile?.width || targetHeight !== originalFile?.height) && (
                      <span className="px-1.5 py-0.2 bg-zinc-700 text-[10px] font-mono rounded-full">
                        {targetWidth}x{targetHeight}
                      </span>
                    )}
                  </button>
                </div>

                <span className="text-[11px] font-mono text-zinc-500">
                  {targetWidth || originalFile?.width} x {targetHeight || originalFile?.height}px
                </span>
              </div>
            </div>
          </div>

          {/* Format & Compression Panel (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs flex flex-col h-full justify-between gap-3">
              <span className="text-xs font-semibold text-zinc-800 uppercase tracking-wider block shrink-0">
                Định dạng & Nén
              </span>

              {/* Format selection */}
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { id: "image/avif", label: "AVIF" },
                    { id: "image/webp", label: "WebP" },
                    { id: "image/png", label: "PNG" },
                    { id: "image/jpeg", label: "JPG" },
                  ] as const
                ).map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setExportFormat(fmt.id)}
                    className={`py-1.5 px-2 rounded-md border text-center text-xs transition-all ${
                      exportFormat === fmt.id
                        ? "bg-zinc-900 text-white font-semibold border-zinc-900 shadow-xs"
                        : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              {/* Quality Slider */}
              {exportFormat !== "image/png" && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-600">Chất lượng:</span>
                    <span className="font-mono font-semibold text-zinc-900">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full accent-zinc-900 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              {/* Custom File Name Input */}
              <div className="pt-2 border-t border-zinc-100 space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium text-zinc-700">
                  <FileEdit className="h-3 w-3 text-zinc-500" />
                  <span>Tên file tải về:</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={customFileName}
                    onChange={(e) => setCustomFileName(e.target.value)}
                    placeholder="Nhập tên file (VD: Ảnh gốc đẹp)..."
                    className="w-full text-xs font-mono px-2.5 py-1.5 rounded-md border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                  <span className="text-xs font-mono text-zinc-400 shrink-0">.{currentExt}</span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate">
                  Tên file thực tế: <strong className="font-mono text-zinc-600">{previewCleanName}</strong>
                </p>
              </div>

              {/* AI Cloaking & Anti-Detection Studio */}
              <div className="pt-2 border-t border-zinc-100 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Khử Dấu Vết AI (AI Cloaking)</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                    Purge C2PA
                  </span>
                </div>

                {/* 1. Fake Camera EXIF Profile */}
                <div className="space-y-1.5 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/70">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1 text-[11px] font-medium text-zinc-700">
                      <Camera className="h-3 w-3 text-zinc-500" />
                      <span>Giả lập máy ảnh thực (EXIF):</span>
                    </label>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {CAMERA_PROFILES[cameraProfile]?.badge}
                    </span>
                  </div>

                  <select
                    value={cameraProfile}
                    onChange={(e) => setCameraProfile(e.target.value as CameraProfileKey)}
                    className="w-full text-xs bg-white text-zinc-800 px-2 py-1.5 rounded border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    {(Object.keys(CAMERA_PROFILES) as CameraProfileKey[]).map((key) => (
                      <option key={key} value={key}>
                        {CAMERA_PROFILES[key].name}
                      </option>
                    ))}
                  </select>

                  {cameraProfile !== "none" && exportFormat !== "image/jpeg" && (
                    <div className="flex items-center justify-between pt-0.5 text-[10px] text-amber-700">
                      <span>Khuyên dùng JPG để nhúng EXIF</span>
                      <button
                        type="button"
                        onClick={() => setExportFormat("image/jpeg")}
                        className="underline font-semibold hover:text-amber-900 cursor-pointer"
                      >
                        Chuyển sang JPG
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Analog Film Grain / Sensor Noise */}
                <div className="space-y-1.5 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/70">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-zinc-700 flex items-center gap-1">
                      <Sliders className="h-3 w-3 text-zinc-500" />
                      <span>Hạt nhiễu cảm biến (Grain):</span>
                    </span>
                    <span className="font-mono font-semibold text-zinc-900">
                      {grainIntensity === 0 ? "Tắt" : `${grainIntensity}%`}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={15}
                    step={1}
                    value={grainIntensity}
                    onChange={(e) => setGrainIntensity(parseInt(e.target.value) || 0)}
                    className="w-full accent-zinc-900 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                  />

                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-[10px] text-zinc-400">Khử sáp nhựa & phá SynthID</span>
                    <div className="flex gap-1">
                      {[
                        { label: "0%", val: 0 },
                        { label: "Tự nhiên 3%", val: 3 },
                        { label: "Máy phim 7%", val: 7 },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => setGrainIntensity(preset.val)}
                          className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                            grainIntensity === preset.val
                              ? "bg-zinc-900 text-white border-zinc-900 font-medium"
                              : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Toggles: Micro Edge Crop & Pixel Jitter */}
                <div className="space-y-1 pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-600">
                    <input
                      type="checkbox"
                      checked={microEdgeCrop}
                      onChange={(e) => setMicroEdgeCrop(e.target.checked)}
                      className="rounded text-zinc-900 accent-zinc-900"
                    />
                    <span className="text-[11px]">Cắt viền 1-2px (Làm lệch lưới watermark ẩn)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-600">
                    <input
                      type="checkbox"
                      checked={applyPixelHygiene}
                      onChange={(e) => setApplyPixelHygiene(e.target.checked)}
                      className="rounded text-zinc-900 accent-zinc-900"
                    />
                    <span className="text-[11px]">Pixel Jitter LSB (Xáo trộn khóa steganography)</span>
                  </label>
                </div>
              </div>

              {/* Actions & Results Container (Sticky to bottom) */}
              <div className="mt-auto pt-2 space-y-2">
                {/* Process Action Button */}
                <button
                  type="button"
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="w-full py-2 px-4 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 text-white rounded-md font-medium text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <RotateCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Đang nén...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Xử lý & Nén Ảnh</span>
                    </>
                  )}
                </button>

                {/* Results Stats & Download Box */}
                {processedResult && (
                  <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-zinc-600">
                      <span>Trước: <strong className="font-mono text-zinc-800">{formatBytes(processedResult.originalSize)}</strong></span>
                      <span>Sau: <strong className="font-mono text-zinc-900">{formatBytes(processedResult.newSize)}</strong></span>
                      <span className="font-bold text-emerald-700">-{processedResult.savedPercentage}%</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-md font-medium text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Tải về ({previewCleanName})</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Crop Popup Modal */}
          <CropModal
            isOpen={isCropModalOpen}
            onClose={() => setIsCropModalOpen(false)}
            imageSrc={imageSrc}
            initialCropArea={croppedAreaPixels}
            onApplyCrop={handleApplyCrop}
          />

          {/* Resize Popup Modal */}
          <ResizeModal
            isOpen={isResizeModalOpen}
            onClose={() => setIsResizeModalOpen(false)}
            baseWidth={croppedAreaPixels?.width || originalFile?.width || 0}
            baseHeight={croppedAreaPixels?.height || originalFile?.height || 0}
            currentWidth={targetWidth}
            currentHeight={targetHeight}
            onApplyResize={handleApplyResize}
          />
        </div>
      )}
    </div>
  );
}
