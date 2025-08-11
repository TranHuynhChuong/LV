/* eslint-disable @typescript-eslint/no-explicit-any */
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { numberToVietnameseCurrencyWords } from './number-to-vietnamese-currency-words';

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxCharsPerLine) {
      currentLine += word + ' ';
    } else {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    }
  }

  if (currentLine.trim()) lines.push(currentLine.trim());
  return lines;
}

export async function generateDeliveryNotePdf(order: any) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const regularFontBytes = await fetch('/fonts/Noto_Sans/NotoSans-Regular.ttf').then((res) =>
    res.arrayBuffer()
  );
  const semiBoldFontBytes = await fetch('/fonts/Noto_Sans/NotoSans-SemiBold.ttf').then((res) =>
    res.arrayBuffer()
  );

  const regularFont = await pdfDoc.embedFont(regularFontBytes);
  const semiBoldFont = await pdfDoc.embedFont(semiBoldFontBytes);

  const A5_WIDTH = 420;
  const A5_HEIGHT = 595;
  const MARGIN = 40;
  const LINE_HEIGHT = 16;
  const TABLE_COLS = [30, 180, 60, 80];

  const page = pdfDoc.addPage([A5_WIDTH, A5_HEIGHT]);
  let y = page.getHeight() - MARGIN;

  const centerText = (text: string, size = 12, bold = false) => {
    const font = bold ? semiBoldFont : regularFont;
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (A5_WIDTH - textWidth) / 2,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
    y -= LINE_HEIGHT;
  };

  const drawText = (text: string, size = 8, x: number, bold = false) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: bold ? semiBoldFont : regularFont,
      color: rgb(0, 0, 0),
    });
  };

  centerText('DẬT LẠC', 12, true);
  centerText('63 Ấp 8, Xã Long Trị, TP Cần Thơ', 9);
  centerText('07029220412', 9);
  y -= 4;
  centerText('PHIẾU GIAO HÀNG', 13, true);
  y -= 10;

  drawText(`Khách hàng: ${order.shippingInfo.recipientName}`, 8, MARGIN);
  y -= LINE_HEIGHT;
  drawText(`SĐT: ${order.shippingInfo.phoneNumber}`, 8, MARGIN);
  y -= LINE_HEIGHT;
  drawText(`Địa chỉ: ${order.shippingInfo.addressInfo.fulltext}`, 8, MARGIN);
  y -= LINE_HEIGHT;
  drawText(`Ghi chú: ${order.shippingInfo.note || '-'}`, 8, MARGIN);
  y -= LINE_HEIGHT;

  drawText(`Mã đơn: ${order.orderId}`, 8, MARGIN);
  drawText(
    `Ngày đặt: ${new Intl.DateTimeFormat('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(order.createdAt))}`,
    8,
    A5_WIDTH / 2
  );

  y -= LINE_HEIGHT * 2;
  // Table Header
  const tableHeaders = ['STT', 'Tên sản phẩm', 'SL', 'Đơn giá'];
  let x = MARGIN;
  tableHeaders.forEach((header, i) => {
    drawText(header, 8, x, true);
    x += TABLE_COLS[i];
  });
  y -= 8;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: A5_WIDTH - MARGIN, y },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });

  y -= LINE_HEIGHT;
  let totalBook = 0;

  order.orderDetails.forEach((item: any, index: number) => {
    const cols = [
      (index + 1).toString(),
      item.bookName,
      item.quantity.toString(),
      `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
        item.priceBuy * item.quantity
      )}`,
    ];

    x = MARGIN;
    let rowHeight = LINE_HEIGHT;

    cols.forEach((text, i) => {
      if (i === 1) {
        const lines = wrapText(text, 36);
        lines.forEach((line, j) => {
          page.drawText(line, {
            x,
            y: y - j * 10,
            size: 8,
            font: regularFont,
            color: rgb(0, 0, 0),
          });
        });
        rowHeight = Math.max(rowHeight, lines.length * 10);
      } else {
        drawText(text, 8, x);
      }
      x += TABLE_COLS[i];
    });

    totalBook += item.priceBuy * item.quantity;
    y -= rowHeight + 4;
  });

  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: A5_WIDTH - MARGIN, y },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  y -= 20;

  const shipping = order.shippingFee;
  const discount = order.discountInvoice + order.discountShipping;
  const total = totalBook + shipping - discount;

  const drawRight = (label: string, value: string, bold = false) => {
    drawText(label, 8, MARGIN, bold);
    drawText(value, 8, MARGIN * 8 - 8, bold);
    y -= LINE_HEIGHT;
  };

  drawRight(
    'Tổng tiền hàng',
    `${Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalBook)}`
  );
  drawRight(
    'Phí vận chuyển',
    `${Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shipping)}`
  );
  drawRight(
    'Giảm giá',
    `-${Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discount)}`
  );
  drawRight(
    'Tổng thanh toán',
    `${Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}`,
    true
  );

  drawText(`Số tiền bằng chữ: ${numberToVietnameseCurrencyWords(total)}`, 8, MARGIN);

  const isPaid = order?.payment?.isPaid;
  if (isPaid) {
    y -= LINE_HEIGHT;
    drawText(`Đã thanh toán (${order?.payment?.method})`, 8, MARGIN);
  }

  // Signatures
  y -= LINE_HEIGHT * 2;
  drawText('Người Nhận', 8, MARGIN);
  drawText('NV Giao Nhận', 8, A5_WIDTH - 120);
  y -= LINE_HEIGHT;
  drawText('(Ký và ghi rõ họ tên)', 7, MARGIN);
  drawText('(Ký và ghi rõ họ tên)', 7, A5_WIDTH - 120);

  // Footer
  y -= LINE_HEIGHT * 6;
  centerText('Vui lòng kiểm tra hàng trước khi thanh toán!', 9);

  const rawBytes = await pdfDoc.save();
  const fixedBuffer = new Uint8Array(new Uint8Array(rawBytes).buffer as ArrayBuffer);
  const blob = new Blob([fixedBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  window.open(url);
}
