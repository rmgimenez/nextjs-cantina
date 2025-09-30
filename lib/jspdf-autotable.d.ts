/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface AutoTableOptions {
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    startY?: number;
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid';
    tableWidth?: 'auto' | 'wrap' | number;
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    theme?: 'striped' | 'grid' | 'plain';
    styles?: any;
    bodyStyles?: any;
    alternateRowStyles?: any;
    headStyles?: any;
    footStyles?: any;
    columnStyles?: { [key: string]: any };
    didDrawPage?: (data: any) => void;
    didDrawCell?: (data: any) => void;
    willDrawCell?: (data: any) => void;
    didParseCell?: (data: any) => void;
  }

  export default function autoTable(doc: jsPDF, options: AutoTableOptions): void;

  global {
    interface jsPDF {
      lastAutoTable: {
        finalY: number;
      };
    }
  }
}
