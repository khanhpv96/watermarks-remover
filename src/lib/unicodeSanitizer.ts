/**
 * Layer A: Invisible Unicode, AI Steganography & AI Typography Sanitizer
 * Handles Zero-width characters, Homoglyphs, Bidi controls, En-dashes/Em-dashes,
 * Typographic quotes, Ellipsis, and Fullwidth stretched characters.
 */

// Invisible and format control characters commonly used for LLM watermarking or steganography
export const STRIP_CODEPOINTS: ReadonlySet<number> = new Set([
  0x00ad, // soft hyphen
  0x034f, // combining grapheme joiner
  0x061c, // Arabic letter mark
  0x115f, // Hangul choseong filler
  0x1160, // Hangul jungseong filler
  0x17b4, // Khmer vowel inherent AQ
  0x17b5, // Khmer vowel inherent AA
  0x180b, // Mongolian free variation selector-1
  0x180c, // Mongolian free variation selector-2
  0x180d, // Mongolian free variation selector-3
  0x180e, // Mongolian vowel separator
  0x180f, // Mongolian free variation selector-4
  0x200b, // zero width space (ZWSP)
  0x200c, // zero width non-joiner (ZWNJ)
  0x200d, // zero width joiner (ZWJ)
  0x200e, // left-to-right mark (LRM)
  0x200f, // right-to-left mark (RLM)
  0x202a, // left-to-right embedding (LRE)
  0x202b, // right-to-left embedding (RLE)
  0x202c, // pop directional formatting (PDF)
  0x202d, // left-to-right override (LRO)
  0x202e, // right-to-left override (RLO)
  0x2060, // word joiner (WJ)
  0x2061, // function application
  0x2062, // invisible times
  0x2063, // invisible separator
  0x2064, // invisible plus
  0x2066, // left-to-right isolate (LRI)
  0x2067, // right-to-left isolate (RLI)
  0x2068, // first strong isolate (FSI)
  0x2069, // pop directional isolate (PDI)
  0x206a, // inhibit symmetric swapping
  0x206b,
  0x206c,
  0x206d,
  0x206e,
  0x206f,
  0xfeff, // byte order mark (BOM) / zero width no-break space
  0xfe00, // variation selector-1
  0xfe01,
  0xfe02,
  0xfe03,
  0xfe04,
  0xfe05,
  0xfe06,
  0xfe07,
  0xfe08,
  0xfe09,
  0xfe0a,
  0xfe0b,
  0xfe0c,
  0xfe0d,
  0xfe0e,
  0xfe0f, // variation selector-16
  0x3164, // Hangul filler (blank compatibility jamo)
  0xffa0, // halfwidth Hangul filler
  0xfff9, // interlinear annotation anchor
  0xfffa, // interlinear annotation separator
  0xfffb, // interlinear annotation terminator
]);

// Exotic spaces that look identical or nearly identical to standard space (U+0020)
export const SPACE_HOMOGLYPHS: ReadonlyMap<number, string> = new Map([
  [0x00a0, " "], // non-breaking space
  [0x1680, " "], // Ogham space mark
  [0x2000, " "], // en quad
  [0x2001, " "], // em quad
  [0x2002, " "], // en space
  [0x2003, " "], // em space
  [0x2004, " "], // three-per-em space
  [0x2005, " "], // four-per-em space
  [0x2006, " "], // six-per-em space
  [0x2007, " "], // figure space
  [0x2008, " "], // punctuation space
  [0x2009, " "], // thin space
  [0x200a, " "], // hair space
  [0x202f, " "], // narrow no-break space
  [0x205f, " "], // medium mathematical space
  [0x3000, " "], // ideographic space
]);

// AI Dashes and long hyphens (En-dash, Em-dash, Minus, etc.) mapped to standard hyphen '-' (U+002D)
export const DASH_HOMOGLYPHS: ReadonlyMap<number, string> = new Map([
  [0x2013, "-"], // En-dash (–)
  [0x2014, "-"], // Em-dash (—)
  [0x2012, "-"], // Figure dash (‒)
  [0x2015, "-"], // Horizontal bar (―)
  [0x2212, "-"], // Minus sign (−)
  [0x2010, "-"], // Hyphen (‐)
  [0x2011, "-"], // Non-breaking hyphen (‑)
  [0xfe63, "-"], // Small hyphen-minus (﹣)
  [0xff0d, "-"], // Fullwidth hyphen-minus (－)
]);

// Typographic / Curly quotes mapped to standard ASCII straight quotes
export const QUOTE_HOMOGLYPHS: ReadonlyMap<number, string> = new Map([
  [0x201c, '"'], // Left double quotation mark (“)
  [0x201d, '"'], // Right double quotation mark (”)
  [0x201e, '"'], // Double low-9 quotation mark („)
  [0x201f, '"'], // Double high-reversed-9 quotation mark (‟)
  [0x2018, "'"], // Left single quotation mark (‘)
  [0x2019, "'"], // Right single quotation mark (’)
  [0x201a, "'"], // Single low-9 quotation mark (‚)
  [0x201b, "'"], // Single high-reversed-9 quotation mark (‛)
  [0x00ab, '"'], // Left-pointing double angle quotation mark («)
  [0x00bb, '"'], // Right-pointing double angle quotation mark (»)
  [0x2039, "'"], // Single left-pointing angle quotation mark (‹)
  [0x203a, "'"], // Single right-pointing angle quotation mark (›)
]);

// Ellipsis codepoint
export const ELLIPSIS_CODEPOINT = 0x2026; // Horizontal ellipsis (…)

// Confusable Latin lookalikes commonly inserted to evade plagiarism or watermark detection
export const LATIN_CONFUSABLES: ReadonlyMap<number, string> = new Map([
  [0x0410, "A"], // Cyrillic A
  [0x0412, "B"], // Cyrillic Ve
  [0x0415, "E"], // Cyrillic Ie
  [0x041a, "K"], // Cyrillic Ka
  [0x041c, "M"], // Cyrillic Em
  [0x041d, "H"], // Cyrillic En
  [0x041e, "O"], // Cyrillic O
  [0x0420, "P"], // Cyrillic Er
  [0x0421, "C"], // Cyrillic Es
  [0x0422, "T"], // Cyrillic Te
  [0x0425, "X"], // Cyrillic Kha
  [0x0430, "a"], // Cyrillic a
  [0x0435, "e"], // Cyrillic ie
  [0x043e, "o"], // Cyrillic o
  [0x0440, "p"], // Cyrillic er
  [0x0441, "c"], // Cyrillic es
  [0x0443, "y"], // Cyrillic u
  [0x0445, "x"], // Cyrillic kha
  [0x0456, "i"], // Cyrillic Byelorussian-Ukrainian i
  [0xff21, "A"], // Fullwidth A
  [0xff22, "B"],
  [0xff23, "C"],
  [0xff24, "D"],
  [0xff25, "E"],
]);

export type FindingCategory =
  | "invisible"
  | "space_homoglyph"
  | "dash_homoglyph"
  | "quote_homoglyph"
  | "ellipsis"
  | "fullwidth_char"
  | "latin_confusable"
  | "bidi_control";

export interface Finding {
  index: number;
  codepoint: number;
  hex: string;
  charName: string;
  category: FindingCategory;
  originalChar: string;
  suggestedReplacement: string;
}

export interface InspectionReport {
  totalChars: number;
  totalWords: number;
  invisibleCount: number;
  spaceHomoglyphCount: number;
  dashCount: number;
  quoteCount: number;
  ellipsisCount: number;
  fullwidthCount: number;
  confusableCount: number;
  bidiCount: number;
  findings: Finding[];
  isClean: boolean;
}

export interface TextSegment {
  type: "text" | "finding";
  content: string;
  finding?: Finding;
}

export interface CleanOptions {
  stripInvisibles?: boolean;
  normalizeSpaces?: boolean;
  normalizeDashes?: boolean;
  normalizeQuotes?: boolean;
  normalizeEllipsis?: boolean;
  normalizeFullwidth?: boolean;
  replaceConfusables?: boolean;
  nfkcNormalize?: boolean;
}

export function isFullwidth(cp: number): boolean {
  return cp >= 0xff01 && cp <= 0xff5e && !DASH_HOMOGLYPHS.has(cp);
}

export function getFullwidthReplacement(cp: number): string {
  // Convert Fullwidth ASCII variants (0xFF01 - 0xFF5E) to standard ASCII (0x0021 - 0x007E)
  return String.fromCodePoint(cp - 0xfee0);
}

export function getCharName(cp: number): string {
  switch (cp) {
    case 0x200b: return "Zero Width Space (ZWSP)";
    case 0x200c: return "Zero Width Non-Joiner (ZWNJ)";
    case 0x200d: return "Zero Width Joiner (ZWJ)";
    case 0xfeff: return "Byte Order Mark (BOM)";
    case 0x2060: return "Word Joiner (WJ)";
    case 0x00ad: return "Soft Hyphen";
    case 0x00a0: return "Non-Breaking Space (NBSP)";
    case 0x2003: return "Em Space (Khoảng trắng rộng)";
    case 0x2002: return "En Space (Khoảng trắng vừa)";
    case 0x2009: return "Thin Space (Khoảng trắng hẹp)";
    case 0x200a: return "Hair Space";
    case 0x202f: return "Narrow No-Break Space";
    case 0x3000: return "Ideographic Space (Khoảng trắng CJK)";
    case 0x2013: return "En-dash (Dấu gạch ngang –)";
    case 0x2014: return "Em-dash (Dấu gạch ngang dài —)";
    case 0x2212: return "Minus sign (Dấu trừ −)";
    case 0x2015: return "Horizontal bar (Thanh ngang ―)";
    case 0x201c: return "Left Double Quote (“)";
    case 0x201d: return "Right Double Quote (”)";
    case 0x2018: return "Left Single Quote (‘)";
    case 0x2019: return "Right Single Quote (’)";
    case 0x2026: return "Ellipsis (Dấu ba chấm …)";
    case 0x202e: return "Right-to-Left Override (RLO)";
    case 0x202d: return "Left-to-Right Override (LRO)";
    default:
      if (cp >= 0xfe00 && cp <= 0xfe0f) return `Variation Selector-${cp - 0xfe00 + 1}`;
      if (cp >= 0x2066 && cp <= 0x2069) return "Bidi Isolate Control";
      if (isFullwidth(cp)) return `Fullwidth Char (${String.fromCodePoint(cp)})`;
      if (LATIN_CONFUSABLES.has(cp)) return `Homoglyph Lookalike (${LATIN_CONFUSABLES.get(cp)})`;
      return `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
  }
}

export function inspectText(text: string): InspectionReport {
  const findings: Finding[] = [];
  let invisibleCount = 0;
  let spaceHomoglyphCount = 0;
  let dashCount = 0;
  let quoteCount = 0;
  let ellipsisCount = 0;
  let fullwidthCount = 0;
  let confusableCount = 0;
  let bidiCount = 0;

  for (let i = 0; i < text.length; i++) {
    const cp = text.codePointAt(i);
    if (cp === undefined) continue;

    const hex = `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
    const originalChar = String.fromCodePoint(cp);

    if (STRIP_CODEPOINTS.has(cp)) {
      const isBidi = (cp >= 0x202a && cp <= 0x202e) || (cp >= 0x2066 && cp <= 0x2069) || cp === 0x200e || cp === 0x200f;
      if (isBidi) {
        bidiCount++;
      } else {
        invisibleCount++;
      }
      findings.push({
        index: i,
        codepoint: cp,
        hex,
        charName: getCharName(cp),
        category: isBidi ? "bidi_control" : "invisible",
        originalChar,
        suggestedReplacement: "",
      });
    } else if (SPACE_HOMOGLYPHS.has(cp)) {
      spaceHomoglyphCount++;
      findings.push({
        index: i,
        codepoint: cp,
        hex,
        charName: getCharName(cp),
        category: "space_homoglyph",
        originalChar,
        suggestedReplacement: " ",
      });
    } else if (DASH_HOMOGLYPHS.has(cp)) {
      dashCount++;
      findings.push({
        index: i,
        codepoint: cp,
        hex,
        charName: getCharName(cp),
        category: "dash_homoglyph",
        originalChar,
        suggestedReplacement: DASH_HOMOGLYPHS.get(cp) || "-",
      });
    } else if (QUOTE_HOMOGLYPHS.has(cp)) {
      quoteCount++;
      findings.push({
        index: i,
        codepoint: cp,
        hex,
        charName: getCharName(cp),
        category: "quote_homoglyph",
        originalChar,
        suggestedReplacement: QUOTE_HOMOGLYPHS.get(cp) || '"',
      });
    } else if (cp === ELLIPSIS_CODEPOINT) {
      ellipsisCount++;
      findings.push({
        index: i,
        codepoint: cp,
        hex,
        charName: getCharName(cp),
        category: "ellipsis",
        originalChar,
        suggestedReplacement: "...",
      });
    } else if (isFullwidth(cp)) {
      fullwidthCount++;
      findings.push({
        index: i,
        codepoint: cp,
        hex,
        charName: getCharName(cp),
        category: "fullwidth_char",
        originalChar,
        suggestedReplacement: getFullwidthReplacement(cp),
      });
    } else if (LATIN_CONFUSABLES.has(cp)) {
      confusableCount++;
      findings.push({
        index: i,
        codepoint: cp,
        hex,
        charName: getCharName(cp),
        category: "latin_confusable",
        originalChar,
        suggestedReplacement: LATIN_CONFUSABLES.get(cp) || "",
      });
    }

    if (cp > 0xffff) {
      i++;
    }
  }

  const words = text.trim().split(/\s+/).filter(Boolean);

  return {
    totalChars: text.length,
    totalWords: words.length,
    invisibleCount,
    spaceHomoglyphCount,
    dashCount,
    quoteCount,
    ellipsisCount,
    fullwidthCount,
    confusableCount,
    bidiCount,
    findings,
    isClean: findings.length === 0,
  };
}

/**
 * Segments input text into chunks of normal text and findings
 * to render rich in-text visual badges exactly at their real locations.
 */
export function segmentTextWithFindings(text: string): TextSegment[] {
  if (!text) return [];

  const segments: TextSegment[] = [];
  let buffer = "";

  for (let i = 0; i < text.length; i++) {
    const cp = text.codePointAt(i);
    if (cp === undefined) continue;

    const hex = `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
    const originalChar = String.fromCodePoint(cp);

    if (STRIP_CODEPOINTS.has(cp)) {
      if (buffer) {
        segments.push({ type: "text", content: buffer });
        buffer = "";
      }
      const isBidi = (cp >= 0x202a && cp <= 0x202e) || (cp >= 0x2066 && cp <= 0x2069) || cp === 0x200e || cp === 0x200f;
      segments.push({
        type: "finding",
        content: originalChar,
        finding: {
          index: i,
          codepoint: cp,
          hex,
          charName: getCharName(cp),
          category: isBidi ? "bidi_control" : "invisible",
          originalChar,
          suggestedReplacement: "",
        },
      });
    } else if (SPACE_HOMOGLYPHS.has(cp)) {
      if (buffer) {
        segments.push({ type: "text", content: buffer });
        buffer = "";
      }
      segments.push({
        type: "finding",
        content: originalChar,
        finding: {
          index: i,
          codepoint: cp,
          hex,
          charName: getCharName(cp),
          category: "space_homoglyph",
          originalChar,
          suggestedReplacement: " ",
        },
      });
    } else if (DASH_HOMOGLYPHS.has(cp)) {
      if (buffer) {
        segments.push({ type: "text", content: buffer });
        buffer = "";
      }
      segments.push({
        type: "finding",
        content: originalChar,
        finding: {
          index: i,
          codepoint: cp,
          hex,
          charName: getCharName(cp),
          category: "dash_homoglyph",
          originalChar,
          suggestedReplacement: DASH_HOMOGLYPHS.get(cp) || "-",
        },
      });
    } else if (QUOTE_HOMOGLYPHS.has(cp)) {
      if (buffer) {
        segments.push({ type: "text", content: buffer });
        buffer = "";
      }
      segments.push({
        type: "finding",
        content: originalChar,
        finding: {
          index: i,
          codepoint: cp,
          hex,
          charName: getCharName(cp),
          category: "quote_homoglyph",
          originalChar,
          suggestedReplacement: QUOTE_HOMOGLYPHS.get(cp) || '"',
        },
      });
    } else if (cp === ELLIPSIS_CODEPOINT) {
      if (buffer) {
        segments.push({ type: "text", content: buffer });
        buffer = "";
      }
      segments.push({
        type: "finding",
        content: originalChar,
        finding: {
          index: i,
          codepoint: cp,
          hex,
          charName: getCharName(cp),
          category: "ellipsis",
          originalChar,
          suggestedReplacement: "...",
        },
      });
    } else if (isFullwidth(cp)) {
      if (buffer) {
        segments.push({ type: "text", content: buffer });
        buffer = "";
      }
      segments.push({
        type: "finding",
        content: originalChar,
        finding: {
          index: i,
          codepoint: cp,
          hex,
          charName: getCharName(cp),
          category: "fullwidth_char",
          originalChar,
          suggestedReplacement: getFullwidthReplacement(cp),
        },
      });
    } else if (LATIN_CONFUSABLES.has(cp)) {
      if (buffer) {
        segments.push({ type: "text", content: buffer });
        buffer = "";
      }
      segments.push({
        type: "finding",
        content: originalChar,
        finding: {
          index: i,
          codepoint: cp,
          hex,
          charName: getCharName(cp),
          category: "latin_confusable",
          originalChar,
          suggestedReplacement: LATIN_CONFUSABLES.get(cp) || "",
        },
      });
    } else {
      buffer += originalChar;
    }

    if (cp > 0xffff) {
      i++;
    }
  }

  if (buffer) {
    segments.push({ type: "text", content: buffer });
  }

  return segments;
}

export function cleanText(
  text: string,
  options: CleanOptions = {
    stripInvisibles: true,
    normalizeSpaces: true,
    normalizeDashes: true,
    normalizeQuotes: true,
    normalizeEllipsis: true,
    normalizeFullwidth: true,
    replaceConfusables: true,
    nfkcNormalize: true,
  }
): { cleaned: string; removedCount: number } {
  let result = "";
  let removedCount = 0;

  for (let i = 0; i < text.length; i++) {
    const cp = text.codePointAt(i);
    if (cp === undefined) continue;

    if (options.stripInvisibles !== false && STRIP_CODEPOINTS.has(cp)) {
      removedCount++;
    } else if (options.normalizeSpaces !== false && SPACE_HOMOGLYPHS.has(cp)) {
      result += SPACE_HOMOGLYPHS.get(cp);
      removedCount++;
    } else if (options.normalizeDashes !== false && DASH_HOMOGLYPHS.has(cp)) {
      result += DASH_HOMOGLYPHS.get(cp);
      removedCount++;
    } else if (options.normalizeQuotes !== false && QUOTE_HOMOGLYPHS.has(cp)) {
      result += QUOTE_HOMOGLYPHS.get(cp);
      removedCount++;
    } else if (options.normalizeEllipsis !== false && cp === ELLIPSIS_CODEPOINT) {
      result += "...";
      removedCount++;
    } else if (options.normalizeFullwidth !== false && isFullwidth(cp)) {
      result += getFullwidthReplacement(cp);
      removedCount++;
    } else if (options.replaceConfusables !== false && LATIN_CONFUSABLES.has(cp)) {
      result += LATIN_CONFUSABLES.get(cp);
      removedCount++;
    } else {
      result += String.fromCodePoint(cp);
    }

    if (cp > 0xffff) {
      i++;
    }
  }

  if (options.nfkcNormalize) {
    try {
      result = result.normalize("NFKC");
    } catch {
      // Fallback if normalize not supported
    }
  }

  return { cleaned: result, removedCount };
}
