"use client";

import React from "react";
import { ShieldCheck, Image as ImageIcon, FileText } from "lucide-react";

interface HeaderProps {
  activeTab: "image" | "content";
  setActiveTab: (tab: "image" | "content") => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-zinc-900 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="font-bold text-zinc-900 text-sm tracking-tight">
              Watermark Purifier
            </span>
          </div>

          {/* Clean Segmented Tab Switcher */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80">
            <button
              onClick={() => setActiveTab("image")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === "image"
                  ? "bg-white text-zinc-950 shadow-xs font-semibold"
                  : "text-zinc-600 hover:text-zinc-900"
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
                  : "text-zinc-600 hover:text-zinc-900"
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
