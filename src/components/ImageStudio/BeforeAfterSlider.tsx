"use client";

import React, { useState, useRef, useCallback } from "react";
import { Sparkles, Sliders } from "lucide-react";

interface BeforeAfterSliderProps {
  originalUrl: string;
  processedUrl: string;
  originalLabel?: string;
  processedLabel?: string;
}

export function BeforeAfterSlider({
  originalUrl,
  processedUrl,
  originalLabel = "Ảnh Gốc (Có Metadata/AI)",
  processedLabel = "Ảnh Đã Làm Sạch (Clean)",
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  return (
    <div
      ref={containerRef}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative w-full h-full min-h-[360px] sm:min-h-[420px] rounded-xl overflow-hidden select-none border border-zinc-200 bg-zinc-100 cursor-ew-resize shadow-sm"
    >
      {/* Background Image: Processed (Clean) */}
      <img
        src={processedUrl}
        alt="Processed Clean"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
      <div className="absolute bottom-3 right-3 bg-zinc-900/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 z-10">
        <Sparkles className="h-3 w-3 text-emerald-400" />
        {processedLabel}
      </div>

      {/* Foreground Clipped Image: Original */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={originalUrl}
          alt="Original"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none max-w-none"
          style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%" }}
        />
        <div className="absolute bottom-3 left-3 bg-zinc-800/80 backdrop-blur-md text-zinc-200 text-[11px] font-medium px-2.5 py-1 rounded-full shadow-sm z-10">
          {originalLabel}
        </div>
      </div>

      {/* Divider Bar */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.4)] pointer-events-none z-20"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-zinc-800 shadow-md border border-zinc-200 flex items-center justify-center pointer-events-none">
          <Sliders className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
