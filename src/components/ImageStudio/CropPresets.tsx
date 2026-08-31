"use client";

import React from "react";
import { Crop, Square, Smartphone, Monitor, Grid2X2, RectangleHorizontal } from "lucide-react";

export type AspectRatioType = "free" | "1:1" | "16:9" | "9:16" | "4:3" | "3:2";

interface CropPresetsProps {
  currentAspect: AspectRatioType;
  onSelectAspect: (aspect: AspectRatioType, numericRatio?: number) => void;
}

const PRESETS: { id: AspectRatioType; label: string; ratio?: number; desc: string; icon: React.ReactNode }[] = [
  { id: "free", label: "Tự do", ratio: undefined, desc: "Tùy biến tự do", icon: <Crop className="h-3.5 w-3.5" /> },
  { id: "1:1", label: "1:1 Vuông", ratio: 1, desc: "Avatar, Insta Post", icon: <Square className="h-3.5 w-3.5" /> },
  { id: "16:9", label: "16:9 Ngang", ratio: 16 / 9, desc: "YouTube, Banner", icon: <Monitor className="h-3.5 w-3.5" /> },
  { id: "9:16", label: "9:16 Dọc", ratio: 9 / 16, desc: "Story, TikTok, Reels", icon: <Smartphone className="h-3.5 w-3.5" /> },
  { id: "4:3", label: "4:3 Chuẩn", ratio: 4 / 3, desc: "Tablet, Slides", icon: <Grid2X2 className="h-3.5 w-3.5" /> },
  { id: "3:2", label: "3:2 Ảnh", ratio: 3 / 2, desc: "DSLR Photo", icon: <RectangleHorizontal className="h-3.5 w-3.5" /> },
];

export function CropPresets({ currentAspect, onSelectAspect }: CropPresetsProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
        <Crop className="h-3.5 w-3.5 text-zinc-500" /> Tỉ lệ cắt hình (Aspect Ratio)
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {PRESETS.map((preset) => {
          const isActive = currentAspect === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectAspect(preset.id, preset.ratio)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs transition-all ${
                isActive
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                  : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              <div className="mb-1">{preset.icon}</div>
              <span className="font-medium">{preset.label}</span>
              <span className={`text-[10px] mt-0.5 truncate max-w-full ${isActive ? "text-zinc-300" : "text-zinc-400"}`}>
                {preset.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
