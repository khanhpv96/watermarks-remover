"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { ImageStudio } from "@/components/ImageStudio/ImageStudio";
import { ContentStudio } from "@/components/ContentStudio/ContentStudio";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"image" | "content">("image");

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      {/* Minimal Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-6">
        {activeTab === "image" ? <ImageStudio /> : <ContentStudio />}
      </main>
    </div>
  );
}
