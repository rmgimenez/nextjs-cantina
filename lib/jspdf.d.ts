/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'jspdf' {
  export class jsPDF {
    constructor(orientation?: 'portrait' | 'landscape', unit?: string, format?: string | number[]);

    internal: {
      pageSize: {
        getWidth(): number;
        getHeight(): number;
      };
      getNumberOfPages(): number;
    };

    lastAutoTable?: {
      finalY: number;
    };

    setFontSize(size: number): jsPDF;
    setTextColor(r: number, g: number, b: number): jsPDF;
    setFont(fontName: string, fontStyle: string): jsPDF;
    text(text: string | string[], x: number, y: number, options?: any): jsPDF;
    setPage(page: number): jsPDF;
    output(type: 'arraybuffer'): ArrayBuffer;
    output(type: 'blob'): Blob;
    output(type: 'datauristring'): string;
    output(type: 'datauri'): void;
    save(filename: string): void;
  }
}
