import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  // Nếu không có token => redirect đến /login
  if (!token) {
    console.log('Không có token, chuyển hướng đến /login');
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Nếu có token, kiểm tra hạn
  try {
    const payload = jwtDecode<JwtPayload>(token);
    const now = Date.now() / 1000;

    if (payload.exp < now) {
      console.log('Token hết hạn, chuyển hướng đến /login');
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  } catch (error) {
    console.log('Token không hợp lệ:', error);
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return NextResponse.next();
}

// Áp dụng middleware cho /profile và tất cả các đường dẫn con
export const config = {
  matcher: ['/profile/:path*'],
};
