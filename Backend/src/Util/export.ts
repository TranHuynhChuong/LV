import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

export interface SheetData {
  sheetName: string;
  headers: string[];
  rows: (string | number)[][];
}

@Injectable()
export class ExportService {
  async generateExcelBuffer_ordersStats(
    sheets: SheetData[],
    metaInfo: {
      staff: {
        NV_id: string;
        NV_hoTen: string;
        NV_email: string;
        NV_tenVaiTro: string;
        NV_soDienThoai: string;
      };
      dateRange: { start: Date; end: Date };
    }
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    for (const sheetData of sheets) {
      const sheet = workbook.addWorksheet(sheetData.sheetName);
      const totalCols = Math.max(...sheetData.rows.map((r) => r.length), 4);

      // === Tiêu đề chính ===
      const titleRow = sheet.addRow(['THỐNG KÊ BÁN HÀNG']);
      sheet.mergeCells(1, 1, 1, totalCols);
      titleRow.font = {
        size: 20,
        bold: true,
        color: { argb: 'FFFFFFFF' }, // Màu trắng
      };
      titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
      titleRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF000000' }, // Màu nền đen
        };
      });

      // === Thời gian ===
      const dateText = `Từ ngày ${metaInfo.dateRange.start.toLocaleDateString('vi-VN')} đến ngày ${metaInfo.dateRange.end.toLocaleDateString('vi-VN')}`;
      const dateRow = sheet.addRow([dateText]);
      sheet.mergeCells(2, 1, 2, totalCols);
      dateRow.font = { size: 14, italic: true };
      dateRow.alignment = { horizontal: 'center' };
      sheet.addRow([]);

      let currentRowNumber = sheet.rowCount;

      // === Bảng người xuất ===

      const exportTitle = sheet.addRow(['NGƯỜI XUẤT FILE']);
      sheet.mergeCells(4, 1, 4, 2);
      exportTitle.font = { bold: true };
      exportTitle.alignment = { horizontal: 'center' };
      ['A4', 'B4'].forEach((cellRef) => {
        const cell = sheet.getCell(cellRef);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF000000' }, // Màu nền đen
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' }, // Chữ trắng
          bold: true,
        };
      });
      currentRowNumber++;

      const staffRows = [
        ['Mã số', metaInfo.staff.NV_id],
        ['Họ tên', metaInfo.staff.NV_hoTen],
        ['Email', metaInfo.staff.NV_email],
        ['Vai trò', metaInfo.staff.NV_tenVaiTro],
        ['Số điện thoại', metaInfo.staff.NV_soDienThoai],
      ];
      for (const row of staffRows) {
        const r = sheet.insertRow(++currentRowNumber, row);
        r.getCell(1).font = { bold: true };
        r.getCell(1).alignment = { horizontal: 'left' };
        r.getCell(2).alignment = { horizontal: 'left' };
        r.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
          const column = sheet.getColumn(colNumber);
          const rawValue = cell.value;
          const value =
            typeof rawValue === 'object' ||
            typeof rawValue === 'undefined' ||
            rawValue === null
              ? ''
              : String(rawValue);
          const currentLength = value
            .split('\n')
            .reduce((max, line) => Math.max(max, line.trim().length), 0);
          const currentSuggestedWidth = Math.min(currentLength + 2, 30);

          if (!column.width || column.width < currentSuggestedWidth) {
            column.width = currentSuggestedWidth;
          }
        });
      }

      sheet.addRow([]);
      currentRowNumber++;

      // == Bảng chi tiết ==
      const tableStartRow = currentRowNumber + 1;
      const tableStartCell = `A${tableStartRow}`;
      // 1. Header row
      const headers = sheetData.rows[2] as string[];
      // 2. Data rows
      const tableRows = sheetData.rows.slice(3);
      // 3. Thêm bảng Excel
      sheet.addTable({
        name: 'OrderStatsTable',
        ref: tableStartCell,
        headerRow: true,
        totalsRow: true,
        style: {
          theme: 'TableStyleMedium15',
          showRowStripes: true,
        },
        columns: headers.map((h, index) => {
          const lower = h.toLowerCase();
          const isSummaryCol =
            lower.includes('doanh thu') ||
            lower.includes('tổng đơn') ||
            lower.includes('giao thành công') ||
            lower.includes('giao thất bại');

          return {
            name: h,
            totalsRowLabel: index === 0 ? 'Tổng cộng' : undefined,
            totalsRowFunction: isSummaryCol ? 'sum' : undefined,
          };
        }),
        rows: tableRows,
      });

      const totalRowIndex = tableStartRow + tableRows.length + 1; // +1 vì có header
      const totalRow = sheet.getRow(totalRowIndex);
      totalRow.eachCell((cell) => {
        cell.font = { size: 13, bold: true };
      });

      headers.forEach((header, index) => {
        const column = sheet.getColumn(index + 1);

        const allValues = [header, ...tableRows.map((row) => row[index])];

        let maxLength = 0;
        for (const val of allValues) {
          const str = String(val ?? '');
          const lines = str.split('\n');
          const longest = Math.max(...lines.map((line) => line.trim().length));
          maxLength = Math.max(maxLength, longest);
        }

        const suggestedWidth = Math.min(maxLength + 2, 30);

        if (!column.width || column.width < suggestedWidth) {
          column.width = suggestedWidth;
        }

        const lower = header.toLowerCase();
        if (lower.includes('doanh thu')) {
          column.numFmt = '#,##0 [$₫-vi-VN]';
        }
      });

      currentRowNumber += 1 + tableRows.length;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
