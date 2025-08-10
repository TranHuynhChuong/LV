import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const referer = req.headers.get('referer') || '';

  const isFromZaloPay = referer.includes('zalopay.vn');

  if (url.pathname.startsWith('/profile/order') && isFromZaloPay) {
    console.log(1);
    return NextResponse.next();
  }

  const token = req.cookies.get('customer-token')?.value;
  if (!token) {
    console.log(2);
    return NextResponse.redirect(new URL('/login', req.url));
  }
  try {
    const payload = jwtDecode<JwtPayload>(token);
    const now = Date.now() / 1000;

    if (payload.exp < now) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*'],
};
