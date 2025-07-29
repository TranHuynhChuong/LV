import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get('customer-token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
  try {
    const payload = jwtDecode<JwtPayload>(token);
    const now = Date.now() / 1000;

    if (payload.exp < now) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*'],
};
