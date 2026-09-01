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
  LayoutTemplate,
  FileCode2,
  FileCheck2,
  Globe,
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
export type ViewTabMode = "visual" | "code" | "inspector";

export function ContentStudio() {
  const [inputText, setInputText] = useState<string>("");
  const [inputFormat, setInputFormat] = useState<ContentFormat>("html");
  const [outputText, setOutputText] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<ContentFormat>("html");
  
  // View mode for input and output panels
  const [inputViewMode, setInputViewMode] = useState<ViewTabMode>("visual");
  const [outputViewMode, setOutputViewMode] = useState<ViewTabMode>("visual");

  // Cleaning options
  const [stripInvisibles, setStripInvisibles] = useState<boolean>(true);
  const [normalizeSpaces, setNormalizeSpaces] = useState<boolean>(true);
  const [normalizeDashes, setNormalizeDashes] = useState<boolean>(true);
  const [normalizeQuotes, setNormalizeQuotes] = useState<boolean>(true);
  const [normalizeEllipsis, setNormalizeEllipsis] = useState<boolean>(true);
  const [normalizeFullwidth, setNormalizeFullwidth] = useState<boolean>(true);
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

  const cleanOptions = useMemo(() => ({
    stripInvisibles,
    normalizeSpaces,
    normalizeDashes,
    normalizeQuotes,
    normalizeEllipsis,
    normalizeFullwidth,
    replaceConfusables,
    nfkcNormalize,
  }), [
    stripInvisibles,
    normalizeSpaces,
    normalizeDashes,
    normalizeQuotes,
    normalizeEllipsis,
    normalizeFullwidth,
    replaceConfusables,
    nfkcNormalize,
  ]);

  // Clean Action
  const handleClean = useCallback(() => {
    if (!inputText) return;
    const { cleaned } = cleanText(inputText, cleanOptions);
    setOutputText(cleaned);
    setOutputFormat(inputFormat);
  }, [inputText, cleanOptions, inputFormat]);

  // Convert Actions
  const handleConvertToMarkdown = () => {
    if (!inputText) return;
    const { cleaned } = cleanText(inputText, cleanOptions);
    const md = inputFormat === "html" ? htmlToMarkdown(cleaned) : cleaned;
    setOutputText(md);
    setOutputFormat("markdown");
  };

  const handleConvertToHtml = () => {
    if (!inputText) return;
    const { cleaned } = cleanText(inputText, cleanOptions);
    const html = inputFormat === "markdown" || inputFormat === "text" ? markdownToHtml(cleaned) : cleaned;
    setOutputText(html);
    setOutputFormat("html");
  };

  // Smart Multi-MIME Copy (WordPress Visual & Code compatible)
  const handleSmartCopy = async () => {
    if (!outputText) return;

    let htmlPayload = outputText;
    let plainPayload = outputText;

    if (outputFormat === "markdown") {
      htmlPayload = markdownToHtml(outputText);
    } else if (outputFormat === "text") {
      htmlPayload = `<p>${outputText.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`;
    }

    try {
      if (typeof window !== "undefined" && navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([htmlPayload], { type: "text/html" });
        const textBlob = new Blob([plainPayload], { type: "text/plain" });

        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": htmlBlob,
            "text/plain": textBlob,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(htmlPayload);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    } catch {
      // Fallback
      await navigator.clipboard.writeText(outputText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    }
  };

  // Handle rich paste from clipboard (e.g. from WordPress, Word, Web)
  const handlePasteEvent = (e: React.ClipboardEvent) => {
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");

    if (html && html.trim()) {
      // Extract clean inner HTML if wrapped in full doc
      let cleanHtml = html;
      try {
        const doc = new DOMParser().parseFromString(html, "text/html");
        cleanHtml = doc.body.innerHTML;
      } catch {
        cleanHtml = html;
      }
      e.preventDefault();
      setInputText(cleanHtml);
      setInputFormat("html");
      setInputViewMode("visual");
    } else if (text) {
      // If pure text, let normal paste proceed
    }
  };

  // Download output file
  const handleDownload = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    let ext = "html";
    if (outputFormat === "markdown") ext = "md";
    else if (outputFormat === "text") ext = "txt";

    a.download = `wordpress_article_clean.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Sample rich WordPress article
  const handleInsertSample = () => {
    const sample = `<h2>1. Giới thiệu về Công nghệ AI</h2>
<p>Chào bạn\u200B! Trí tuệ nhân tạo — một bước ngoặt lớn (2020 – 2026) đang mang lại <strong>nhiều cơ hội đột phá</strong> cho các nhà sáng tạo nội dung\u2060.</p>
<blockquote>AI là công cụ hỗ trợ đắc lực — giúp tối ưu hóa hiệu suất làm việc của con người\uFEFF.</blockquote>
<h3>Lợi ích nổi bật:</h3>
<ul>
  <li>Tự động hóa <em>quy trình xử lý dữ liệu</em>\u00A0nhanh chóng.</li>
  <li>Soạn thảo bài viết theo chuẩn “SEO chuyên nghiệp”…</li>
  <li>Hỗ trợ xử lý ký tự ＡＢＣ và định dạng WordPress chuẩn.</li>
</ul>`;
    setInputText(sample);
    setInputFormat("html");
    setInputViewMode("visual");
  };

  // Helper to render HTML safe preview
  const renderedInputHtml = useMemo(() => {
    if (!inputText) return "";
    if (inputFormat === "markdown") return markdownToHtml(inputText);
    if (inputFormat === "text") return `<p>${inputText.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`;
    return inputText;
  }, [inputText, inputFormat]);

  const renderedOutputHtml = useMemo(() => {
    if (!outputText) return "";
    if (outputFormat === "markdown") return markdownToHtml(outputText);
    if (outputFormat === "text") return `<p>${outputText.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`;
    return outputText;
  }, [outputText, outputFormat]);

  return (
    <div className="space-y-4">
      {/* Top Conversion Bar */}
      <div className="bg-white rounded-xl border border-zinc-200/90 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-700 flex items-center gap-1">
            <Globe className="h-3.5 w-3.5 text-zinc-500" /> Định dạng bài:
          </span>
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 text-xs">
            <button
              onClick={() => setInputFormat("html")}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                inputFormat === "html"
                  ? "bg-white text-zinc-950 font-bold shadow-xs border border-zinc-200/60"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              HTML (WordPress)
            </button>
            <button
              onClick={() => setInputFormat("markdown")}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                inputFormat === "markdown"
                  ? "bg-white text-zinc-950 font-bold shadow-xs border border-zinc-200/60"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Markdown
            </button>
            <button
              onClick={() => setInputFormat("text")}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                inputFormat === "text"
                  ? "bg-white text-zinc-950 font-bold shadow-xs border border-zinc-200/60"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Văn bản thô
            </button>
          </div>
        </div>

        {/* Quick Convert Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleConvertToMarkdown}
            disabled={!inputText}
            className="px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 text-zinc-700 font-medium transition-all shadow-xs flex items-center gap-1.5"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-zinc-500" />
            <span>Chuyển sang Markdown</span>
          </button>

          <button
            onClick={handleConvertToHtml}
            disabled={!inputText}
            className="px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 text-zinc-700 font-medium transition-all shadow-xs flex items-center gap-1.5"
          >
            <Code className="h-3.5 w-3.5 text-zinc-500" />
            <span>Chuyển sang HTML</span>
          </button>

          <button
            onClick={handleInsertSample}
            className="px-3 py-1.5 rounded-lg border border-dashed border-zinc-300 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 font-medium transition-all flex items-center gap-1"
          >
            <LayoutTemplate className="h-3.5 w-3.5 text-zinc-500" />
            <span>Chèn bài mẫu WP</span>
          </button>
        </div>
      </div>

      {/* Main Dual Editor Panels (Input & Output) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Column: Input (Visual / Code / Inspector) */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col">
          {/* Header with Mode Switcher */}
          <div className="p-2.5 bg-zinc-50/80 border-b border-zinc-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 bg-zinc-200/70 p-0.5 rounded-lg border border-zinc-300/60">
              <button
                type="button"
                onClick={() => setInputViewMode("visual")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                  inputViewMode === "visual"
                    ? "bg-white font-bold text-zinc-950 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
                title="Xem định dạng bài viết trực quan (Heading, Bold, List...)"
              >
                <Eye className="h-3.5 w-3.5 text-emerald-600" />
                <span>Trực quan (Visual)</span>
              </button>
              <button
                type="button"
                onClick={() => setInputViewMode("code")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                  inputViewMode === "code"
                    ? "bg-white font-bold text-zinc-950 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
                title="Xem và sửa mã HTML / Markdown thô"
              >
                <FileCode2 className="h-3.5 w-3.5 text-zinc-600" />
                <span>Mã nguồn (Code)</span>
              </button>
              <button
                type="button"
                onClick={() => setInputViewMode("inspector")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                  inputViewMode === "inspector"
                    ? "bg-white font-bold text-zinc-950 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
                title="Soi vị trí từng ký tự ẩn và dấu hiệu AI"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span>Soi AI ({inspection.findings.length})</span>
              </button>
            </div>

            {/* Badge Status */}
            {inspection.findings.length > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-medium text-[11px]">
                <AlertTriangle className="h-3 w-3 text-amber-600" />
                {inspection.findings.length} dấu vết AI
              </span>
            ) : inputText ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-[11px]">
                <ShieldCheck className="h-3 w-3" />
                Sạch 100%
              </span>
            ) : (
              <span className="text-zinc-400 text-[11px]">
                {inspection.totalWords} từ &middot; {inspection.totalChars} ký tự
              </span>
            )}
          </div>

          {/* Main Input Display */}
          <div className="relative">
            {inputViewMode === "visual" ? (
              /* Visual WYSIWYG Formatted Container */
              <div
                onPaste={handlePasteEvent}
                className="w-full h-88 p-4 bg-white overflow-y-auto article-preview leading-relaxed border-0 focus:outline-none"
              >
                {inputText ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: renderedInputHtml }}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 py-12">
                    <LayoutTemplate className="h-10 w-10 text-zinc-300 mb-2" />
                    <p className="text-sm font-medium text-zinc-600">Dán bài viết HTML từ WordPress hoặc website vào đây</p>
                    <p className="text-xs text-zinc-400 mt-1">Tự động giữ nguyên cấu trúc Heading, Bold, List, Quotes...</p>
                  </div>
                )}
              </div>
            ) : inputViewMode === "code" ? (
              /* Raw Code Editor */
              <>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onPaste={handlePasteEvent}
                  placeholder="Dán mã HTML hoặc Markdown tại đây..."
                  className="w-full h-88 p-4 text-xs sm:text-sm font-mono text-zinc-900 bg-zinc-50/20 border-0 resize-none focus:outline-none placeholder:text-zinc-400 leading-relaxed"
                />
                {inputText && (
                  <button
                    onClick={() => setInputText("")}
                    className="absolute top-2 right-2 p-1.5 text-zinc-400 hover:text-zinc-700 rounded hover:bg-zinc-100 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </>
            ) : (
              /* In-Text Inspector Mode */
              <div className="w-full h-88 p-4 text-xs sm:text-sm font-mono text-zinc-900 bg-zinc-50/40 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed select-text">
                {textSegments.length > 0 ? (
                  textSegments.map((segment, idx) => {
                    if (segment.type === "text") {
                      return <span key={idx}>{segment.content}</span>;
                    }

                    const f = segment.finding!;
                    let badgeColor = "bg-rose-500 text-white border-rose-600";
                    let label = f.hex;

                    if (f.category === "dash_homoglyph") {
                      badgeColor = "bg-amber-600 text-white border-amber-700";
                      label = `DASH: ${f.originalChar}`;
                    } else if (f.category === "quote_homoglyph") {
                      badgeColor = "bg-sky-600 text-white border-sky-700";
                      label = `QUOTE: ${f.originalChar}`;
                    } else if (f.category === "ellipsis") {
                      badgeColor = "bg-indigo-600 text-white border-indigo-700";
                      label = "ELLIPSIS: …";
                    } else if (f.category === "fullwidth_char") {
                      badgeColor = "bg-teal-600 text-white border-teal-700";
                      label = `FULLWIDTH: ${f.originalChar}`;
                    } else if (f.category === "space_homoglyph") {
                      badgeColor = "bg-orange-500 text-white border-orange-600";
                      label = "SPACE";
                    } else if (f.category === "latin_confusable") {
                      badgeColor = "bg-blue-600 text-white border-blue-700";
                      label = `[${f.originalChar}→${f.suggestedReplacement}]`;
                    } else if (f.category === "bidi_control") {
                      badgeColor = "bg-purple-600 text-white border-purple-700";
                    } else if (f.codepoint === 0x200b) label = "ZWSP";
                    else if (f.codepoint === 0x200c) label = "ZWNJ";
                    else if (f.codepoint === 0x200d) label = "ZWJ";
                    else if (f.codepoint === 0xfeff) label = "BOM";
                    else if (f.codepoint === 0x00ad) label = "SHY";
                    else if (f.codepoint === 0x2060) label = "WJ";

                    return (
                      <span
                        key={idx}
                        onClick={() => setSelectedFinding(f)}
                        className={`inline-flex items-center gap-0.5 px-1 py-0.2 mx-0.5 rounded text-[10px] font-bold cursor-pointer transition-transform hover:scale-105 shadow-xs border ${badgeColor}`}
                        title={`${f.charName} (${f.hex}) ➔ Đổi thành: '${f.suggestedReplacement || "(xóa)"}'`}
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
                <Info className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="truncate">
                  <strong className="text-amber-300 font-mono">{selectedFinding.hex}</strong>: {selectedFinding.charName} ➔ Đổi thành: <strong className="text-emerald-400 font-mono">'{selectedFinding.suggestedReplacement || "(xóa)"}'</strong>
                </span>
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                className="text-zinc-400 hover:text-white px-2 py-0.5 text-[10px] rounded bg-zinc-800 shrink-0 ml-2"
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
              className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 text-white rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Xử lý & Làm sạch Bài Viết</span>
            </button>
          </div>
        </div>

        {/* Right Column: Cleaned Output (Visual / Code) */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-2.5 bg-zinc-50/80 border-b border-zinc-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 bg-zinc-200/70 p-0.5 rounded-lg border border-zinc-300/60">
              <button
                type="button"
                onClick={() => setOutputViewMode("visual")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                  outputViewMode === "visual"
                    ? "bg-white font-bold text-zinc-950 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Eye className="h-3.5 w-3.5 text-emerald-600" />
                <span>Trực quan (Visual)</span>
              </button>
              <button
                type="button"
                onClick={() => setOutputViewMode("code")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                  outputViewMode === "code"
                    ? "bg-white font-bold text-zinc-950 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <FileCode2 className="h-3.5 w-3.5 text-zinc-600" />
                <span>Mã nguồn (Code)</span>
              </button>
            </div>

            {outputText && (
              <div className="flex items-center gap-1.5">
                {/* Smart Copy for WordPress */}
                <button
                  onClick={handleSmartCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-xs"
                  title="Sao chép đa định dạng: Dán vào Tab Visual hoặc Tab Code trên WordPress đều chuẩn 100%"
                >
                  {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{isCopied ? "Đã sao chép WP!" : "Sao chép cho WordPress"}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-all shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Tải về</span>
                </button>
              </div>
            )}
          </div>

          {/* Output Display */}
          <div className="relative">
            {outputViewMode === "visual" ? (
              <div className="w-full h-88 p-4 bg-white overflow-y-auto article-preview leading-relaxed border-0">
                {outputText ? (
                  <div dangerouslySetInnerHTML={{ __html: renderedOutputHtml }} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 py-12">
                    <FileCheck2 className="h-10 w-10 text-zinc-300 mb-2" />
                    <p className="text-sm font-medium text-zinc-500">Kết quả bài viết đã làm sạch sẽ hiển thị tại đây</p>
                    <p className="text-xs text-zinc-400 mt-1">Sẵn sàng sao chép và dán trực tiếp vào WordPress</p>
                  </div>
                )}
              </div>
            ) : (
              <textarea
                readOnly
                value={outputText}
                placeholder="Mã nguồn sau khi làm sạch sẽ hiển thị tại đây..."
                className="w-full h-88 p-4 text-xs sm:text-sm font-mono text-zinc-900 bg-zinc-50/20 border-0 resize-none focus:outline-none placeholder:text-zinc-400 leading-relaxed"
              />
            )}
          </div>

          {/* Filter Options */}
          <div className="p-3 bg-zinc-50 border-t border-zinc-200 text-xs">
            <span className="font-semibold text-zinc-700 block text-[11px] uppercase tracking-wider mb-2">
              Tùy chọn chuẩn hóa Typography & Ký tự AI:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-700 text-[11px]">
                <input
                  type="checkbox"
                  checked={normalizeDashes}
                  onChange={(e) => setNormalizeDashes(e.target.checked)}
                  className="rounded text-zinc-900 accent-zinc-900"
                />
                <span>Dấu gạch ngang (–, — ➔ -)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-700 text-[11px]">
                <input
                  type="checkbox"
                  checked={normalizeQuotes}
                  onChange={(e) => setNormalizeQuotes(e.target.checked)}
                  className="rounded text-zinc-900 accent-zinc-900"
                />
                <span>Dấu ngoặc kép (“ ” ➔ &quot; &quot;)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-700 text-[11px]">
                <input
                  type="checkbox"
                  checked={normalizeEllipsis}
                  onChange={(e) => setNormalizeEllipsis(e.target.checked)}
                  className="rounded text-zinc-900 accent-zinc-900"
                />
                <span>Dấu ba chấm (… ➔ ...)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-700 text-[11px]">
                <input
                  type="checkbox"
                  checked={normalizeFullwidth}
                  onChange={(e) => setNormalizeFullwidth(e.target.checked)}
                  className="rounded text-zinc-900 accent-zinc-900"
                />
                <span>Thu hẹp chữ dãn (Ａ ➔ A)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-700 text-[11px]">
                <input
                  type="checkbox"
                  checked={stripInvisibles}
                  onChange={(e) => setStripInvisibles(e.target.checked)}
                  className="rounded text-zinc-900 accent-zinc-900"
                />
                <span>Xóa ký tự ẩn (ZWSP, BOM, Bidi)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-700 text-[11px]">
                <input
                  type="checkbox"
                  checked={normalizeSpaces}
                  onChange={(e) => setNormalizeSpaces(e.target.checked)}
                  className="rounded text-zinc-900 accent-zinc-900"
                />
                <span>Chuẩn hóa khoảng trắng lạ</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-700 text-[11px]">
                <input
                  type="checkbox"
                  checked={replaceConfusables}
                  onChange={(e) => setReplaceConfusables(e.target.checked)}
                  className="rounded text-zinc-900 accent-zinc-900"
                />
                <span>Thay thế Homoglyph Cyrillic</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-700 text-[11px]">
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
