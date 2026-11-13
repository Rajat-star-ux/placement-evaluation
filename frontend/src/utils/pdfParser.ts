import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
// @ts-ignore
import * as pdfjsWorkerModule from 'pdfjs-dist/build/pdf.worker.mjs';

// Polyfill Uint8Array.prototype.toHex (required by modern pdfjs-dist 6.x)
// Must be configured as non-enumerable to prevent breaking for...in loops
if (typeof Uint8Array !== 'undefined' && !(Uint8Array.prototype as any).toHex) {
  Object.defineProperty(Uint8Array.prototype, 'toHex', {
    value: function () {
      return Array.from(this)
        .map((b: any) => b.toString(16).padStart(2, '0'))
        .join('');
    },
    writable: true,
    configurable: true,
    enumerable: false,
  });
}

// In-memory worker setup to guarantee 100% offline support without external CDN dependency
if (typeof globalThis !== 'undefined') {
  const handler = (pdfjsWorkerModule as any)?.WorkerMessageHandler;
  if (handler) {
    (globalThis as any).pdfjsWorker = { WorkerMessageHandler: handler };
  }

  if (pdfjsLib.GlobalWorkerOptions) {
    try {
      // Use locally served worker url from Vite
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    } catch {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    }
  }
}

export interface PDFParseResult {
  text: string;
  pageCount: number;
  wordCount: number;
}

/**
 * Clean and filter raw text extracted from PDF tokens.
 * Strips non-printable ASCII control characters while preserving newlines and indentation.
 */
function sanitizeExtractedText(rawText: string): string {
  return rawText
    // Remove control characters (except newline \n, tab \t, carriage return \r)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    // Normalize unicode non-breaking spaces
    .replace(/[\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/g, ' ')
    // Replace 3+ consecutive newlines with 2 newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Fallback stream parser to extract readable text when PDF.js fails on complex/non-standard PDF structures.
 */
async function fallbackExtractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const bytes = new Uint8Array(arrayBuffer);
    const textDecoder = new TextDecoder('latin1');
    const rawStr = textDecoder.decode(bytes);

    const extractedChunks: string[] = [];

    const extractFromContent = (content: string) => {
      // Match (Text) Tj
      const tjRegex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*Tj/g;
      let m;
      while ((m = tjRegex.exec(content)) !== null) {
        const unescaped = m[1].replace(/\\([()\\])/g, '$1');
        if (unescaped.trim()) extractedChunks.push(unescaped);
      }

      // Match [(T) 10 (ext)] TJ
      const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
      while ((m = tjArrayRegex.exec(content)) !== null) {
        const inner = m[1];
        const innerRegex = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g;
        let im;
        let chunk = '';
        while ((im = innerRegex.exec(inner)) !== null) {
          chunk += im[1].replace(/\\([()\\])/g, '$1');
        }
        if (chunk.trim()) extractedChunks.push(chunk);
      }
    };

    extractFromContent(rawStr);

    // If uncompressed stream gave low text, try decompressing Flate streams
    if (extractedChunks.length < 10 && typeof DecompressionStream !== 'undefined') {
      const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
      let sMatch;
      while ((sMatch = streamRegex.exec(rawStr)) !== null) {
        try {
          const streamStartIndex = sMatch.index + sMatch[0].indexOf('\n') + 1;
          const streamEndIndex = sMatch.index + sMatch[0].lastIndexOf('endstream');
          const compressedSlice = bytes.subarray(streamStartIndex, streamEndIndex);

          const ds = new DecompressionStream('deflate');
          const writer = ds.writable.getWriter();
          writer.write(compressedSlice);
          writer.close();

          const response = new Response(ds.readable);
          const decompressedBuffer = await response.arrayBuffer();
          const decompressedText = textDecoder.decode(decompressedBuffer);
          extractFromContent(decompressedText);
        } catch {
          // Ignore individual non-deflate streams
        }
      }
    }

    return extractedChunks.join(' ').replace(/\s+/g, ' ').trim();
  } catch {
    return '';
  }
}

/**
 * Extract selectable text from an uploaded PDF file using Mozilla PDF.js.
 * Preserves structured layout with line and paragraph breaks.
 */
export async function extractTextFromPDF(file: File): Promise<PDFParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  let pageCount = 1;
  const pageTexts: string[] = [];

  try {
    const loadingTask = pdfjsLib.getDocument({
      data,
      useWorkerFetch: false,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    pageCount = pdf.numPages;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      let lastY: number | null = null;
      const lines: string[] = [];
      let currentLine = '';

      for (const item of textContent.items as any[]) {
        if (!('str' in item)) continue;
        const text: string = item.str;

        if (!text) {
          if (item.hasEOL && currentLine.trim()) {
            lines.push(currentLine.trim());
            currentLine = '';
          }
          continue;
        }

        // Check vertical displacement to detect line breaks in PDF layout
        const currentY: number | null =
          item.transform && Array.isArray(item.transform) ? item.transform[5] : null;

        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 3) {
          if (currentLine.trim()) {
            lines.push(currentLine.trim());
          }
          currentLine = text;
        } else {
          // Same line: join with space if needed
          const needsSpace = currentLine && !currentLine.endsWith(' ') && !text.startsWith(' ');
          currentLine += (needsSpace ? ' ' : '') + text;
        }

        if (item.hasEOL) {
          if (currentLine.trim()) {
            lines.push(currentLine.trim());
          }
          currentLine = '';
          lastY = null;
        } else {
          lastY = currentY;
        }
      }

      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }

      const pageStr = lines.join('\n').trim();
      if (pageStr) {
        pageTexts.push(pageStr);
      }
    }
  } catch (pdfjsErr) {
    console.warn('PDF.js parsing encountered an error, trying fallback parser:', pdfjsErr);
    const fallbackText = await fallbackExtractTextFromPDF(arrayBuffer);
    if (fallbackText && fallbackText.length >= 20) {
      pageTexts.push(fallbackText);
    }
  }

  const rawFullText = pageTexts.join('\n\n').trim();
  const cleanedText = sanitizeExtractedText(rawFullText);

  // Check if meaningful alphanumeric content was extracted
  const alphanumericCount = (cleanedText.match(/[a-zA-Z0-9]/g) || []).length;

  if (alphanumericCount < 20) {
    throw new Error(
      'Unable to extract selectable text from this PDF. The document may be a scanned image or non-OCR document.'
    );
  }

  const wordCount = cleanedText ? cleanedText.split(/\s+/).filter(Boolean).length : 0;

  return {
    text: cleanedText,
    pageCount,
    wordCount,
  };
}
