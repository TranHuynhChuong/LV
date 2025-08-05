import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

export interface SheetData {
  sheetName: string;
  headers: string[];
  rows: (string | number)[][];
}

@Injectable()
export class ExportService {
  /**
   * Tạo file Excel thống kê đơn hàng và trả về dưới dạng Buffer.
   *
   * @param sheets - Mảng dữ liệu các sheet cần ghi vào file Excel.
   * @param metaInfo - Thông tin người lập báo cáo và khoảng thời gian thống kê.
   * @param metaInfo.staff - Thông tin nhân viên lập báo cáo.
   * @param metaInfo.dateRange - Khoảng thời gian thống kê đơn hàng.
   * @returns Buffer chứa nội dung file Excel đã tạo.
   */
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

      sheet.addRow([]);
      currentRowNumber++;

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

      // === Ghi thông tin người thực hiện & ngày xuất ở cuối bảng ===
      const exportDate = new Date().toLocaleDateString('vi-VN');
      const leftLine1 = `${metaInfo.staff.NV_hoTen} - ${metaInfo.staff.NV_id} - ${metaInfo.staff.NV_tenVaiTro}`;
      const leftLine2 = `${metaInfo.staff.NV_soDienThoai} - ${metaInfo.staff.NV_email}`;
      const rightLine1 = `Ngày xuất ${exportDate}`;
      const rightLine2 = `${metaInfo.staff.NV_hoTen}`;

      const middleCol = Math.floor(totalCols / 2) + 1;

      // === Row 1
      const footerRow1 = sheet.addRow([]);
      sheet.mergeCells(footerRow1.number, 1, footerRow1.number, middleCol - 1);
      sheet.mergeCells(
        footerRow1.number,
        middleCol,
        footerRow1.number,
        totalCols
      );

      footerRow1.getCell(1).value = leftLine1;
      footerRow1.getCell(1).alignment = { horizontal: 'left' };
      footerRow1.getCell(middleCol).value = rightLine1;
      footerRow1.getCell(middleCol).alignment = { horizontal: 'right' };
      footerRow1.font = { italic: true, size: 12 };

      // === Row 2
      const footerRow2 = sheet.addRow([]);
      sheet.mergeCells(footerRow2.number, 1, footerRow2.number, middleCol - 1);
      sheet.mergeCells(
        footerRow2.number,
        middleCol,
        footerRow2.number,
        totalCols
      );

      footerRow2.getCell(1).value = leftLine2;
      footerRow2.getCell(1).alignment = { horizontal: 'left' };
      footerRow2.getCell(middleCol).value = rightLine2;
      footerRow2.getCell(middleCol).alignment = { horizontal: 'right' };
      footerRow2.font = { italic: true, size: 12 };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
