import { NextResponse } from 'next/server';

const orders = [
  { id: 'DH001', status: 'Đã giao', customer: 'Nguyễn Văn A' },
  { id: 'DH002', status: 'Đang xử lý', customer: 'Lê Thị B' },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id')?.toUpperCase() || '';
  const result = orders.find((order) => order.id === id);
  return NextResponse.json(result ? [result] : []);
}
