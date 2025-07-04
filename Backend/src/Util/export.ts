import { Injectable } from '@nestjs/common';
import * as xlsx from 'node-xlsx';

export interface SheetData {
  sheetName: string;
  headers?: (string | number)[];
  rows: (string | number)[][];
}

@Injectable()
export class ExportService {
  generateExcelBuffer(sheets: SheetData[]): Buffer {
    const data = sheets.map((sheet) => {
      const content = sheet.headers
        ? [sheet.headers, ...sheet.rows]
        : sheet.rows;
      return {
        name: sheet.sheetName,
        data: content,
        options: {},
      };
    });

    return xlsx.build(data);
  }

  generateExcelFileName(prefix = 'export'): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${prefix}___createAt-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.xlsx`;
  }
}
