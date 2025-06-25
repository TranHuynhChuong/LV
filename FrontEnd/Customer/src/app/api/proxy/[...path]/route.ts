import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

export async function handler(req: NextRequest, context: { params: { path: string[] } }) {
  const token = (await cookies()).get('staff-token')?.value;
  const { path } = await context.params;

  const url = `${process.env.NEXT_PUBLIC_API}/${path.join('/')}`;

  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });
  delete headers['content-length'];

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const body =
    req.method === 'GET' || req.method === 'HEAD'
      ? undefined
      : Buffer.from(await req.arrayBuffer());

  const response = await axios({
    url,
    method: req.method,
    headers,
    data: body,
    params: Object.fromEntries(req.nextUrl.searchParams),
    responseType: 'arraybuffer',
    validateStatus: () => true,
  });

  if (response.status === 401 || response.status === 403) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const responseHeaders = new Headers();
  Object.entries(response.headers).forEach(([key, value]) => {
    if (typeof value === 'string') {
      responseHeaders.set(key, value);
    } else if (Array.isArray(value)) {
      responseHeaders.set(key, value.join(', '));
    }
  });

  if (response.status === 304) {
    return new NextResponse(null, {
      status: 304,
      headers: responseHeaders,
    });
  }

  return new NextResponse(response.data, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
