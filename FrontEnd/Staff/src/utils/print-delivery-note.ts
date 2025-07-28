/* eslint-disable @typescript-eslint/no-explicit-any */
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { numberToVietnameseCurrencyWords } from './number-to-vietnamese-currency-words';

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
  drawText(`Ngày đặt: ${new Date(order.createdAt).toLocaleString()}`, 8, A5_WIDTH / 2);

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
  let totalProduct = 0;

  order.orderDetails.forEach((item: any, index: number) => {
    const cols = [
      (index + 1).toString(),
      item.productName,
      item.quantity.toString(),
      `${(item.priceBuy * item.quantity).toLocaleString()} đ`,
    ];

    x = MARGIN;
    cols.forEach((text, i) => {
      drawText(text, 8, x);
      x += TABLE_COLS[i];
    });

    totalProduct += item.priceBuy * item.quantity;
    y -= LINE_HEIGHT;
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
  const total = totalProduct + shipping - discount;

  const drawRight = (label: string, value: string, bold = false) => {
    drawText(label, 8, MARGIN, bold);
    drawText(value, 8, MARGIN * 8 - 8, bold);
    y -= LINE_HEIGHT;
  };

  drawRight('Tổng tiền hàng', `${totalProduct.toLocaleString()} đ`);
  drawRight('Phí vận chuyển', `${shipping.toLocaleString()} đ`);
  drawRight('Giảm giá', `-${discount.toLocaleString()} đ`);
  drawRight('Tổng thanh toán', `${total.toLocaleString()} đ`, true);

  drawText(`Số tiền bằng chữ: ${numberToVietnameseCurrencyWords(total)}`, 8, MARGIN);
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

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  window.open(url);
}
