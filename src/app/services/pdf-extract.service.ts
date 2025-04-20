import { Injectable } from '@angular/core';
import { PDFDocumentProxy, getDocument } from 'pdfjs-dist';

@Injectable({
  providedIn: 'root',
})
export class PdfExtractService {
  private pdfDoc: PDFDocumentProxy | null = null;

  constructor() {}

  // Method to load the PDF
  async loadPdf(file: File): Promise<PDFDocumentProxy> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = getDocument({ data: new Uint8Array(arrayBuffer) });
    this.pdfDoc = await loadingTask.promise;
    return this.pdfDoc;
  }

  async extractText(): Promise<string> {
    if (!this.pdfDoc) {
      console.error('No PDF available');
      return '';
    }

    let fullText = '';

    for (let i = 1; i <= this.pdfDoc.numPages; i++) {
      const page = await this.pdfDoc.getPage(i);
      const content = await page.getTextContent();

      fullText += `\n\n--- Page ${i} ---\n`;

      const items = content.items as any[];
      let lines: { str: string; y: number; fontSize: number }[] = [];

      for (const item of items) {
        lines.push({
          str: item.str.trim(),
          y: item.transform[5],
          fontSize: item.height || 10,
        });
      }

      lines.sort((a, b) => b.y - a.y);

      let paragraphs: string[] = [];
      let currentParagraph = '';
      let prevY: number | null = null;
      const lineHeightThreshold = 2;

      const isLikelyHeading = (line: string, fontSize: number) =>
        fontSize > 14 || /^[A-Z\s]{5,}$/.test(line.trim());

      for (const line of lines) {
        const { str, y, fontSize } = line;
        if (!str) continue;

        const verticalGap = prevY !== null ? Math.abs(prevY - y) : Infinity;

        if (isLikelyHeading(str, fontSize)) {
          if (currentParagraph.trim()) {
            paragraphs.push(`##paragraph: ${currentParagraph.trim()}`);
            currentParagraph = '';
          }
          paragraphs.push(`#heading: ${str}`);
          prevY = null;
          continue;
        }

        if (verticalGap > lineHeightThreshold * fontSize) {
          if (currentParagraph.trim()) {
            paragraphs.push(`##paragraph: ${currentParagraph.trim()}`);
            currentParagraph = '';
          }
        }

        currentParagraph += (currentParagraph ? ' ' : '') + str;
        prevY = y;
      }

      if (currentParagraph.trim()) {
        paragraphs.push(`##paragraph: ${currentParagraph.trim()}`);
      }

      paragraphs.push(`#image: [possible image on page ${i}]`);

      fullText += paragraphs.join('\n\n') + '\n';
    }

    return fullText;
  }
}
