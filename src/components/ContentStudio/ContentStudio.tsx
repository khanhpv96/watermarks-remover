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
  const [inputFormat, setInputFormat] = useState<ContentFormat>("html");
  const [outputText, setOutputText] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<ContentFormat>("html");
  
  // View mode for left and right boxes: "editor" vs "preview"
  const [inputViewMode, setInputViewMode] = useState<"editor" | "preview">("editor");
  const [outputViewMode, setOutputViewMode] = useState<"editor" | "preview">("editor");

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

  // Smart Multi-MIME Copy: Ghi đồng thời text/html và text/plain
  const handleCopy = async () => {
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
        await navigator.clipboard.writeText(outputText);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      await navigator.clipboard.writeText(outputText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
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

  // Quick sample with HTML formatting & AI characters
  const handleInsertSample = () => {
    const sample = `<h2>1. Giới thiệu về Công nghệ AI</h2>
<p>Chào bạn\u200B! Trí tuệ nhân tạo — một bước ngoặt lớn (2020 – 2026) đang mang lại <strong>nhiều cơ hội đột phá</strong> cho người viết content\u2060.</p>
<blockquote>AI là công cụ hỗ trợ — giúp tối ưu hóa hiệu suất làm việc của con người\uFEFF.</blockquote>
<h3>Lợi ích nổi bật:</h3>
<ul>
  <li>Tự động hóa <em>quy trình xử lý dữ liệu</em>\u00A0nhanh chóng.</li>
  <li>Soạn thảo bài viết theo chuẩn “SEO chuyên nghiệp”…</li>
  <li>Hỗ trợ xử lý ký tự ＡＢＣ và định dạng WordPress chuẩn.</li>
</ul>`;
    setInputText(sample);
    setInputFormat("html");
    setInputViewMode("preview");
  };

  // Formatted HTML for Preview
  const inputRenderedHtml = useMemo(() => {
    if (!inputText) return "";
    if (inputFormat === "markdown") return markdownToHtml(inputText);
    if (inputFormat === "text") return `<p>${inputText.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`;
    return inputText;
  }, [inputText, inputFormat]);

  const outputRenderedHtml = useMemo(() => {
    if (!outputText) return "";
    if (outputFormat === "markdown") return markdownToHtml(outputText);
    if (outputFormat === "text") return `<p>${outputText.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`;
    return outputText;
  }, [outputText, outputFormat]);

  return (
    <div className="space-y-4">
      {/* Top Format Selector Bar */}
      <div className="bg-white rounded-xl border border-zinc-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-700">Định dạng:</span>
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 text-xs">
            <button
              onClick={() => setInputFormat("text")}
              className={`px-3 py-1 rounded-md transition-all ${
                inputFormat === "text"
                  ? "bg-white text-zinc-900 font-semibold shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Text
            </button>
            <button
              onClick={() => setInputFormat("markdown")}
              className={`px-3 py-1 rounded-md transition-all ${
                inputFormat === "markdown"
                  ? "bg-white text-zinc-900 font-semibold shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Markdown
            </button>
            <button
              onClick={() => setInputFormat("html")}
              className={`px-3 py-1 rounded-md transition-all ${
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
            className="px-2.5 py-1 rounded-md border border-dashed border-zinc-300 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 font-medium transition-all"
          >
            Chèn mẫu thử
          </button>
        </div>
      </div>

      {/* Main Dual Panels with Responsive Dynamic Height */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* Left Column: Input Box */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col h-full">
          {/* Header */}
          <div className="p-2.5 bg-zinc-50/80 border-b border-zinc-200 flex items-center justify-between text-xs shrink-0">
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
                <span>Nhập liệu ({inputFormat.toUpperCase()})</span>
              </button>
              <button
                type="button"
                onClick={() => setInputViewMode("preview")}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-xs transition-all ${
                  inputViewMode === "preview"
                    ? "bg-white font-semibold text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Eye className="h-3 w-3 text-emerald-600" />
                <span>Preview & Soi AI ({inspection.findings.length})</span>
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
                Sạch
              </span>
            ) : (
              <span className="text-zinc-400 text-[11px]">
                {inspection.totalWords} từ &middot; {inspection.totalChars} ký tự
              </span>
            )}
          </div>

          {/* Dynamic Height Input Area */}
          <div className="relative flex-1">
            {inputViewMode === "editor" ? (
              <>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    inputFormat === "html"
                      ? "Dán mã HTML bài viết tại đây (vd: <h2>Tiêu đề</h2><p>Nội dung <strong>in đậm</strong>...</p>)..."
                      : "Dán hoặc nhập nội dung văn bản tại đây..."
                  }
                  className="w-full h-[calc(100vh-370px)] min-h-[480px] p-4 text-xs sm:text-sm font-mono text-zinc-900 bg-white border-0 resize-none focus:outline-none placeholder:text-zinc-400 leading-relaxed overflow-y-auto"
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
              /* Preview Mode */
              <div className="w-full h-[calc(100vh-370px)] min-h-[480px] p-4 bg-zinc-50/30 overflow-y-auto article-preview leading-relaxed select-text">
                {inputText ? (
                  inputFormat === "html" || inputFormat === "markdown" ? (
                    <div dangerouslySetInnerHTML={{ __html: inputRenderedHtml }} />
                  ) : (
                    /* Plain text segment rendering */
                    <div className="whitespace-pre-wrap font-mono text-xs sm:text-sm">
                      {textSegments.map((segment, idx) => {
                        if (segment.type === "text") return <span key={idx}>{segment.content}</span>;
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
                        }
                        return (
                          <span
                            key={idx}
                            onClick={() => setSelectedFinding(f)}
                            className={`inline-flex items-center gap-0.5 px-1 py-0.2 mx-0.5 rounded text-[10px] font-bold cursor-pointer border ${badgeColor}`}
                            title={`${f.charName} (${f.hex})`}
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <span className="text-zinc-400 italic text-xs">Chưa có nội dung để xem trước.</span>
                )}
              </div>
            )}
          </div>

          {/* Finding Details Banner */}
          {selectedFinding && (
            <div className="p-2 bg-zinc-900 text-white text-xs flex items-center justify-between border-t border-zinc-800 shrink-0">
              <div className="flex items-center gap-2 truncate">
                <Info className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="truncate">
                  <strong className="text-amber-300 font-mono">{selectedFinding.hex}</strong>: {selectedFinding.charName} ➔ Đổi thành: <strong className="text-emerald-400 font-mono">'{selectedFinding.suggestedReplacement || "(xóa)"}'</strong>
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
          <div className="p-3 bg-zinc-50 border-t border-zinc-200 shrink-0">
            <button
              onClick={handleClean}
              disabled={!inputText}
              className="w-full py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 text-white rounded-md font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Xử lý & Làm sạch Ký tự AI</span>
            </button>
          </div>
        </div>

        {/* Right Column: Output Box */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col h-full">
          {/* Header */}
          <div className="p-2.5 bg-zinc-50/80 border-b border-zinc-200 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-1.5 bg-zinc-200/70 p-0.5 rounded-md border border-zinc-300/60">
              <button
                type="button"
                onClick={() => setOutputViewMode("editor")}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-all ${
                  outputViewMode === "editor"
                    ? "bg-white font-semibold text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <span>Mã kết quả ({outputFormat.toUpperCase()})</span>
              </button>
              <button
                type="button"
                onClick={() => setOutputViewMode("preview")}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-all ${
                  outputViewMode === "preview"
                    ? "bg-white font-semibold text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Eye className="h-3 w-3 text-emerald-600" />
                <span>Preview</span>
              </button>
            </div>

            {outputText && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold transition-all shadow-xs"
                  title="Sao chép chuẩn: Dán vào WordPress Tab Visual hoặc Tab Code đều nhận đúng 100%"
                >
                  {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{isCopied ? "Đã sao chép!" : "Sao chép"}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-all shadow-xs"
                >
                  <Download className="h-3 w-3" />
                  <span>Tải về</span>
                </button>
              </div>
            )}
          </div>

          {/* Dynamic Height Output Area */}
          <div className="relative flex-1">
            {outputViewMode === "editor" ? (
              <textarea
                readOnly
                value={outputText}
                placeholder="Kết quả sau khi làm sạch sẽ hiển thị tại đây..."
                className="w-full h-[calc(100vh-370px)] min-h-[480px] p-4 text-xs sm:text-sm font-mono text-zinc-900 bg-zinc-50/20 border-0 resize-none focus:outline-none placeholder:text-zinc-400 leading-relaxed overflow-y-auto"
              />
            ) : (
              <div className="w-full h-[calc(100vh-370px)] min-h-[480px] p-4 bg-white overflow-y-auto article-preview leading-relaxed select-text">
                {outputText ? (
                  <div dangerouslySetInnerHTML={{ __html: outputRenderedHtml }} />
                ) : (
                  <span className="text-zinc-400 italic text-xs">Chưa có kết quả để xem trước.</span>
                )}
              </div>
            )}
          </div>

          {/* Filter Options */}
          <div className="p-3 bg-zinc-50 border-t border-zinc-200 text-xs shrink-0">
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-600 text-[11px]">
                <input
                  type="checkbox"
                  checked={normalizeDashes}
                  onChange={(e) => setNormalizeDashes(e.target.checked)}
                  className="rounded text-zinc-900 accent-zinc-900"
                />
                <span>Dấu gạch ngang (–, — ➔ -)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-600 text-[11px]">
                <input
                  type="checkbox"
                  checked={normalizeQuotes}
                  onChange={(e) => setNormalizeQuotes(e.target.checked)}
                  className="rounded text-zinc-900 accent-zinc-900"
                />
                <span>Dấu ngoặc kép (“ ” ➔ &quot; &quot;)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-600 text-[11px]">
                <input
                  type="checkbox"
                  checked={normalizeEllipsis}
                  onChange={(e) => setNormalizeEllipsis(e.target.checked)}
                  className="rounded text-zinc-900 accent-zinc-900"
                />
                <span>Dấu ba chấm (… ➔ ...)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-600 text-[11px]">
                <input
                  type="checkbox"
                  checked={normalizeFullwidth}
                  onChange={(e) => setNormalizeFullwidth(e.target.checked)}
                  className="rounded text-zinc-900 accent-zinc-900"
                />
                <span>Thu hẹp chữ dãn (Ａ ➔ A)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-600 text-[11px]">
                <input
                  type="checkbox"
                  checked={stripInvisibles}
                  onChange={(e) => setStripInvisibles(e.target.checked)}
                  className="rounded text-zinc-900 accent-zinc-900"
                />
                <span>Xóa ký tự ẩn (ZWSP, BOM)</span>
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
