import TurndownService from "turndown";
import { marked } from "marked";

// Configure Turndown for clean Markdown generation
const turndownService = new TurndownService({
  headingStyle: "atx",
  hr: "---",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
  strongDelimiter: "**",
});

// Remove script and style tags completely
turndownService.remove(["script", "style", "noscript", "iframe"]);

export function htmlToMarkdown(html: string): string {
  if (!html || !html.trim()) return "";
  try {
    return turndownService.turndown(html);
  } catch (error) {
    console.error("HTML to Markdown conversion error:", error);
    return html;
  }
}

export function markdownToHtml(markdown: string): string {
  if (!markdown || !markdown.trim()) return "";
  try {
    return marked.parse(markdown, { async: false }) as string;
  } catch (error) {
    console.error("Markdown to HTML conversion error:", error);
    return markdown;
  }
}

export function toPlainText(input: string, isHtml: boolean = false): string {
  if (!input) return "";
  if (isHtml) {
    // If it's HTML, convert to text via DOMParser if in browser
    if (typeof window !== "undefined") {
      const doc = new DOMParser().parseFromString(input, "text/html");
      return doc.body.textContent || "";
    }
    return input.replace(/<[^>]+>/g, "");
  } else {
    // If it's Markdown, parse to HTML then strip
    const html = markdownToHtml(input);
    if (typeof window !== "undefined") {
      const doc = new DOMParser().parseFromString(html, "text/html");
      return doc.body.textContent || "";
    }
    return html.replace(/<[^>]+>/g, "");
  }
}
