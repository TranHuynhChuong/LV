import { NextResponse } from 'next/server';

const books = [
  { id: '1', title: 'Lập trình Node.js', author: 'Nguyễn Văn A' },
  { id: '2', title: 'Cơ sở dữ liệu', author: 'Trần Văn B' },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  const result = books.filter((book) => book.title.toLowerCase().includes(query));
  return NextResponse.json(result);
}
