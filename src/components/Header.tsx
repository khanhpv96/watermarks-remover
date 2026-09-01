"use client";

import React from "react";
import { Shield, Image as ImageIcon, FileText } from "lucide-react";

interface HeaderProps {
  activeTab: "image" | "content";
  setActiveTab: (tab: "image" | "content") => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-zinc-900 flex items-center justify-center text-white shadow-xs border border-zinc-800">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900 text-sm tracking-tight">
                Watermark Purifier
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200/80 text-[10px] font-mono text-zinc-600">
                v1.2
              </span>
            </div>
          </div>

          {/* Clean Segmented Tab Control */}
          <div className="flex items-center bg-zinc-100/90 p-0.5 rounded-lg border border-zinc-200/80 shadow-xs">
            <button
              onClick={() => setActiveTab("image")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === "image"
                  ? "bg-white text-zinc-950 shadow-xs font-semibold"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50"
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Xử lý ảnh</span>
            </button>
            <button
              onClick={() => setActiveTab("content")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === "content"
                  ? "bg-white text-zinc-950 shadow-xs font-semibold"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Xử lý nội dung</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
