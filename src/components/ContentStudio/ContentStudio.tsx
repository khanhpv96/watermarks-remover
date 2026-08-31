"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Code,
  Sparkles,
  Copy,
  Check,
  Download,
  AlertTriangle,
  ShieldCheck,
  ArrowRightLeft,
  Eye,
  Trash2,
  Edit3,
  Info,
} from "lucide-react";
import {
  inspectText,
  cleanText,
  segmentTextWithFindings,
  InspectionReport,
  Finding,
} from "@/lib/unicodeSanitizer";
import {
  htmlToMarkdown,
  markdownToHtml,
} from "@/lib/formatConverter";

export type ContentFormat = "text" | "markdown" | "html";

export function ContentStudio() {
  const [inputText, setInputText] = useState<string>("");
  const [inputFormat, setInputFormat] = useState<ContentFormat>("text");
  const [outputText, setOutputText] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<ContentFormat>("text");
  
  // View mode for input box: "editor" vs "visualizer"
  const [inputViewMode, setInputViewMode] = useState<"editor" | "visualizer">("editor");

  // Options
  const [stripInvisibles, setStripInvisibles] = useState<boolean>(true);
  const [normalizeSpaces, setNormalizeSpaces] = useState<boolean>(true);
  const [replaceConfusables, setReplaceConfusables] = useState<boolean>(true);
  const [nfkcNormalize, setNfkcNormalize] = useState<boolean>(true);

  // UI state
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  // Live Inspection
  const inspection: InspectionReport = useMemo(() => {
    return inspectText(inputText);
  }, [inputText]);

  // Live Segments for In-Text Preview
  const textSegments = useMemo(() => {
    return segmentTextWithFindings(inputText);
  }, [inputText]);

  // Clean Action
  const handleClean = useCallback(() => {
    if (!inputText) return;
    const { cleaned } = cleanText(inputText, {
      stripInvisibles,
      normalizeSpaces,
      replaceConfusables,
      nfkcNormalize,
    });
    setOutputText(cleaned);
    setOutputFormat(inputFormat);
  }, [inputText, stripInvisibles, normalizeSpaces, replaceConfusables, nfkcNormalize, inputFormat]);

  // Convert Actions
  const handleConvertToMarkdown = () => {
    if (!inputText) return;
    const { cleaned } = cleanText(inputText, {
      stripInvisibles,
      normalizeSpaces,
      replaceConfusables,
      nfkcNormalize,
    });
    const md = inputFormat === "html" ? htmlToMarkdown(cleaned) : cleaned;
    setOutputText(md);
    setOutputFormat("markdown");
  };

  const handleConvertToHtml = () => {
    if (!inputText) return;
    const { cleaned } = cleanText(inputText, {
      stripInvisibles,
      normalizeSpaces,
      replaceConfusables,
      nfkcNormalize,
    });
    const html = inputFormat === "markdown" || inputFormat === "text" ? markdownToHtml(cleaned) : cleaned;
    setOutputText(html);
    setOutputFormat("html");
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Download output file
  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    let ext = "txt";
    if (outputFormat === "markdown") ext = "md";
    else if (outputFormat === "html") ext = "html";

    a.download = `content_clean.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Quick sample
  const handleInsertSample = () => {
    const sample = `Chào bạn\u200B, đây là văn bản thử nghiệm\u200D có ký tự ẩn\uFEFF và khoảng trắng lạ\u00A0do AI tạo ra\u2060.`;
    setInputText(sample);
    setInputFormat("text");
    setInputViewMode("visualizer");
  };

  return (
    <div className="space-y-4">
      {/* Compact Top Conversion Bar */}
      <div className="bg-white rounded-xl border border-zinc-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-700">Định dạng:</span>
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 text-xs">
            <button
              onClick={() => setInputFormat("text")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                inputFormat === "text"
                  ? "bg-white text-zinc-900 font-semibold shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Text
            </button>
            <button
              onClick={() => setInputFormat("markdown")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                inputFormat === "markdown"
                  ? "bg-white text-zinc-900 font-semibold shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Markdown
            </button>
            <button
              onClick={() => setInputFormat("html")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                inputFormat === "html"
                  ? "bg-white text-zinc-900 font-semibold shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              HTML
            </button>
          </div>
        </div>

        {/* Quick Convert Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleConvertToMarkdown}
            disabled={!inputText}
            className="px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 text-zinc-700 font-medium transition-all shadow-xs flex items-center gap-1"
          >
            <ArrowRightLeft className="h-3 w-3 text-zinc-500" />
            <span>Sang Markdown</span>
          </button>

          <button
            onClick={handleConvertToHtml}
            disabled={!inputText}
            className="px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 text-zinc-700 font-medium transition-all shadow-xs flex items-center gap-1"
          >
            <Code className="h-3 w-3 text-zinc-500" />
            <span>Sang HTML</span>
          </button>

          <button
            onClick={handleInsertSample}
            className="px-2 py-1 rounded-md border border-dashed border-zinc-300 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 font-medium transition-all"
          >
            Chèn mẫu thử
          </button>
        </div>
      </div>

      {/* Main Dual Editor Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Column: Input & AI Watermark Visualizer */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col">
          {/* Header with Mode Switcher */}
          <div className="p-2.5 bg-zinc-50/80 border-b border-zinc-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 bg-zinc-200/70 p-0.5 rounded-md border border-zinc-300/60">
              <button
                type="button"
                onClick={() => setInputViewMode("editor")}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-xs transition-all ${
                  inputViewMode === "editor"
                    ? "bg-white font-semibold text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Edit3 className="h-3 w-3" />
                <span>Nhập liệu</span>
              </button>
              <button
                type="button"
                onClick={() => setInputViewMode("visualizer")}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-xs transition-all ${
                  inputViewMode === "visualizer"
                    ? "bg-white font-semibold text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Eye className="h-3 w-3 text-rose-600" />
                <span>Soi ký tự ẩn ({inspection.findings.length})</span>
              </button>
            </div>

            {/* Badge Status */}
            {inspection.findings.length > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-medium text-[11px]">
                <AlertTriangle className="h-3 w-3" />
                {inspection.findings.length} ký tự ẩn
              </span>
            ) : inputText ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-[11px]">
                <ShieldCheck className="h-3 w-3" />
                Sạch
              </span>
            ) : (
              <span className="text-zinc-400 text-[11px]">
                {inspection.totalWords} từ &middot; {inspection.totalChars} ký tự
              </span>
            )}
          </div>

          {/* Input Box / Visualizer Box */}
          <div className="relative">
            {inputViewMode === "editor" ? (
              <>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Dán hoặc nhập nội dung văn bản, mã HTML hoặc Markdown tại đây..."
                  className="w-full h-80 p-3.5 text-xs sm:text-sm font-mono text-zinc-900 bg-white border-0 resize-none focus:outline-none placeholder:text-zinc-400 leading-relaxed"
                />
                {inputText && (
                  <button
                    onClick={() => setInputText("")}
                    className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-zinc-700 rounded hover:bg-zinc-100 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </>
            ) : (
              /* Rich In-Text Visualizer Mode */
              <div className="w-full h-80 p-3.5 text-xs sm:text-sm font-mono text-zinc-900 bg-zinc-50/40 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed select-text">
                {textSegments.length > 0 ? (
                  textSegments.map((segment, idx) => {
                    if (segment.type === "text") {
                      return <span key={idx}>{segment.content}</span>;
                    }

                    const f = segment.finding!;
                    const isSpace = f.category === "space_homoglyph";
                    const isConfusable = f.category === "latin_confusable";
                    const isBidi = f.category === "bidi_control";

                    let badgeColor = "bg-rose-500 text-white border-rose-600";
                    let label = f.hex;

                    if (f.codepoint === 0x200b) label = "ZWSP";
                    else if (f.codepoint === 0x200c) label = "ZWNJ";
                    else if (f.codepoint === 0x200d) label = "ZWJ";
                    else if (f.codepoint === 0xfeff) label = "BOM";
                    else if (f.codepoint === 0x00ad) label = "SHY";
                    else if (f.codepoint === 0x2060) label = "WJ";
                    else if (isSpace) {
                      badgeColor = "bg-amber-500 text-white border-amber-600";
                      label = "SPACE";
                    } else if (isConfusable) {
                      badgeColor = "bg-blue-600 text-white border-blue-700";
                      label = `[${f.originalChar}→${f.suggestedReplacement}]`;
                    } else if (isBidi) {
                      badgeColor = "bg-purple-600 text-white border-purple-700";
                    }

                    return (
                      <span
                        key={idx}
                        onClick={() => setSelectedFinding(f)}
                        className={`inline-flex items-center gap-0.5 px-1 py-0.2 mx-0.5 rounded text-[10px] font-bold cursor-pointer transition-transform hover:scale-105 shadow-xs border ${badgeColor}`}
                        title={`${f.charName} (${f.hex})`}
                      >
                        {label}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-zinc-400 italic">Chưa có văn bản.</span>
                )}
              </div>
            )}
          </div>

          {/* Finding Details Banner */}
          {selectedFinding && (
            <div className="p-2.5 bg-zinc-900 text-white text-xs flex items-center justify-between border-t border-zinc-800">
              <div className="flex items-center gap-2 truncate">
                <Info className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                <span className="truncate">
                  <strong className="text-rose-300 font-mono">{selectedFinding.hex}</strong>: {selectedFinding.charName} (index {selectedFinding.index})
                </span>
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                className="text-zinc-400 hover:text-white px-1.5 py-0.5 text-[10px] rounded bg-zinc-800 shrink-0 ml-2"
              >
                Đóng
              </button>
            </div>
          )}

          {/* Clean Action Button */}
          <div className="p-3 bg-zinc-50 border-t border-zinc-200">
            <button
              onClick={handleClean}
              disabled={!inputText}
              className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 text-white rounded-md font-medium text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Xử lý & Tẩy sạch ký tự AI</span>
            </button>
          </div>
        </div>

        {/* Right Column: Cleaned Output */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-2.5 bg-zinc-50/80 border-b border-zinc-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-800">
              Kết quả đã làm sạch ({outputFormat.toUpperCase()})
            </span>

            {outputText && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-all shadow-xs"
                >
                  {isCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{isCopied ? "Đã chép" : "Sao chép"}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-all shadow-xs"
                >
                  <Download className="h-3 w-3" />
                  <span>Tải về</span>
                </button>
              </div>
            )}
          </div>

          {/* Text Area Output */}
          <div className="relative">
            <textarea
              readOnly
              value={outputText}
              placeholder="Kết quả sau khi làm sạch sẽ hiển thị tại đây..."
              className="w-full h-80 p-3.5 text-xs sm:text-sm font-mono text-zinc-900 bg-zinc-50/30 border-0 resize-none focus:outline-none placeholder:text-zinc-400 leading-relaxed"
            />
          </div>

          {/* Filter Options (Clean & Compact) */}
          <div className="p-3 bg-zinc-50 border-t border-zinc-200 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-600 text-[11px]">
                <input
                  type="checkbox"
                  checked={stripInvisibles}
                  onChange={(e) => setStripInvisibles(e.target.checked)}
                  className="rounded text-zinc-900 accent-zinc-900"
                />
                <span>Xóa ký tự ẩn (ZWSP, BOM, Bidi)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-600 text-[11px]">
                <input
                  type="checkbox"
                  checked={normalizeSpaces}
                  onChange={(e) => setNormalizeSpaces(e.target.checked)}
                  className="rounded text-zinc-900 accent-zinc-900"
                />
                <span>Chuẩn hóa khoảng trắng lạ</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-600 text-[11px]">
                <input
                  type="checkbox"
                  checked={replaceConfusables}
                  onChange={(e) => setReplaceConfusables(e.target.checked)}
                  className="rounded text-zinc-900 accent-zinc-900"
                />
                <span>Thay thế Homoglyph</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-600 text-[11px]">
                <input
                  type="checkbox"
                  checked={nfkcNormalize}
                  onChange={(e) => setNfkcNormalize(e.target.checked)}
                  className="rounded text-zinc-900 accent-zinc-900"
                />
                <span>Chuẩn hóa Unicode NFKC</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
