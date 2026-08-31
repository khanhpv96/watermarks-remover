"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { X, Crop, Check, RotateCcw } from "lucide-react";
import { CropPresets, AspectRatioType } from "./CropPresets";

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  initialCropArea?: Area | null;
  onApplyCrop: (croppedArea: Area | null, aspectType: AspectRatioType) => void;
}

export function CropModal({
  isOpen,
  onClose,
  imageSrc,
  initialCropArea,
  onApplyCrop,
}: CropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectType, setAspectType] = useState<AspectRatioType>("free");
  const [numericAspect, setNumericAspect] = useState<number | undefined>(undefined);
  const [tempCroppedArea, setTempCroppedArea] = useState<Area | null>(initialCropArea || null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setTempCroppedArea(croppedAreaPixels);
  }, []);

  const handleSelectAspect = (type: AspectRatioType, ratio?: number) => {
    setAspectType(type);
    setNumericAspect(ratio);
  };

  const handleApply = () => {
    onApplyCrop(tempCroppedArea, aspectType);
    onClose();
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setAspectType("free");
    setNumericAspect(undefined);
    setTempCroppedArea(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200">
              <Crop className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Cắt ảnh (Crop Tool)</h3>
              <p className="text-xs text-zinc-500">Chọn tỉ lệ khung hình hoặc tùy biến kéo thả vùng cắt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body: Cropper Canvas */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          <div className="relative w-full h-[360px] sm:h-[420px] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-200">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={numericAspect}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              classes={{
                containerClassName: "rounded-xl",
                mediaClassName: "rounded-xl",
              }}
            />

            {/* Zoom Slider Overlay */}
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-zinc-900/85 backdrop-blur-md px-3 py-2 rounded-lg border border-zinc-800 flex items-center gap-3 z-10 text-white text-xs">
              <span className="font-medium">Thu phóng:</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-28 sm:w-36 accent-white h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-[11px] text-zinc-300 w-8">{Math.round(zoom * 100)}%</span>
            </div>
          </div>

          {/* Aspect Presets */}
          <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200/80">
            <CropPresets currentAspect={aspectType} onSelectAspect={handleSelectAspect} />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Đặt lại toàn bộ</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-medium transition-colors shadow-xs"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] text-white text-xs font-medium transition-all shadow-sm flex items-center gap-1.5"
            >
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Áp dụng cắt ảnh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
