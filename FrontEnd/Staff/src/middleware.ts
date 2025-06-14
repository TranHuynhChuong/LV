import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  userId: string;
  role: number;
}

const roleRequiredPaths: Record<string, number[]> = {
  '/accounts': [1], // chỉ Admin
  '/products': [1, 2],
  '/categories': [1, 2],
  '/promotions': [1, 2],
  '/reviews': [1, 2],
  '/shipping': [1, 2],
  '/report': [1],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  // Nếu không có token và không phải trang login => redirect login
  if (!token && pathname !== '/login') {
    console.log('Redirect về /login vì không có token');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token) {
    try {
      const payload = jwtDecode<JwtPayload>(token);

      const now = Date.now() / 1000;
      if (payload.exp < now) {
        if (pathname !== '/login') {
          return NextResponse.redirect(new URL('/login', req.url));
        }
      }

      // Kiểm tra quyền với regex path chính xác
      for (const [path, allowedRoles] of Object.entries(roleRequiredPaths)) {
        const pathRegex = new RegExp(`^${path}(/|$)`);
        if (pathRegex.test(pathname)) {
          if (!allowedRoles.includes(payload.role)) {
            if (pathname !== '/403') {
              return NextResponse.redirect(new URL('/403', req.url));
            }
          }
        }
      }
    } catch (error) {
      console.log('Lỗi decode token:', error);
      if (pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|login|public|favicon.ico).*)'],
};
