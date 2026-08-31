"use client";

import React, { useState, useEffect } from "react";
import { X, Maximize2, Lock, Unlock, Check, RotateCcw } from "lucide-react";

interface ResizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseWidth: number;
  baseHeight: number;
  currentWidth: number;
  currentHeight: number;
  onApplyResize: (width: number, height: number) => void;
}

export function ResizeModal({
  isOpen,
  onClose,
  baseWidth,
  baseHeight,
  currentWidth,
  currentHeight,
  onApplyResize,
}: ResizeModalProps) {
  const [width, setWidth] = useState<number>(currentWidth || baseWidth);
  const [height, setHeight] = useState<number>(currentHeight || baseHeight);
  const [lockAspect, setLockAspect] = useState<boolean>(true);

  const aspect = baseWidth && baseHeight ? baseWidth / baseHeight : 1;

  useEffect(() => {
    if (isOpen) {
      setWidth(currentWidth || baseWidth);
      setHeight(currentHeight || baseHeight);
    }
  }, [isOpen, currentWidth, currentHeight, baseWidth, baseHeight]);

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && aspect > 0) {
      setHeight(Math.round(val / aspect));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && aspect > 0) {
      setWidth(Math.round(val * aspect));
    }
  };

  const handleQuickScale = (scale: number) => {
    const newW = Math.round(baseWidth * scale);
    const newH = Math.round(baseHeight * scale);
    setWidth(newW);
    setHeight(newH);
  };

  const handleReset = () => {
    setWidth(baseWidth);
    setHeight(baseHeight);
  };

  const handleApply = () => {
    onApplyResize(width, height);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-md w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200">
              <Maximize2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Thay đổi Kích thước (Resize)</h3>
              <p className="text-xs text-zinc-500">Kích thước gốc: {baseWidth} x {baseHeight}px</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Dimension Inputs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                Kích thước tùy chọn
              </span>
              <button
                type="button"
                onClick={() => setLockAspect(!lockAspect)}
                className={`p-1 rounded text-xs flex items-center gap-1 border transition-all ${
                  lockAspect
                    ? "bg-zinc-100 text-zinc-900 border-zinc-300 font-medium"
                    : "text-zinc-400 border-transparent hover:border-zinc-200"
                }`}
                title={lockAspect ? "Đang khóa tỷ lệ" : "Tự do chỉnh"}
              >
                {lockAspect ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                <span className="text-[11px]">{lockAspect ? "Đang khóa tỷ lệ" : "Tự do"}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-zinc-500 mb-1 block">Chiều rộng (Width)</span>
                <div className="relative">
                  <input
                    type="number"
                    value={width || ""}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                    className="w-full text-sm font-mono px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs text-zinc-400 pointer-events-none">px</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-zinc-500 mb-1 block">Chiều cao (Height)</span>
                <div className="relative">
                  <input
                    type="number"
                    value={height || ""}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                    className="w-full text-sm font-mono px-3 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs text-zinc-400 pointer-events-none">px</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Scale Presets */}
          <div className="space-y-2 pt-2 border-t border-zinc-100">
            <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
              Scale nhanh theo tỷ lệ %
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {[0.25, 0.5, 0.75, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleQuickScale(s)}
                  className="py-1.5 px-2 rounded-md bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                >
                  {s * 100}%
                </button>
              ))}
            </div>
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
            <span>Mặc định</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-medium transition-colors shadow-xs"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] text-white text-xs font-medium transition-all shadow-sm flex items-center gap-1.5"
            >
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Áp dụng kích thước</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
