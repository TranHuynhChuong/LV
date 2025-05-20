import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  userId: string;
  role: string;
}

const roleRequiredPaths: Record<string, string[]> = {
  '/accounts': ['Admin'],
  '/products': ['Manager', 'Admin'],
  '/categories': ['Manager', 'Admin'],
  '/promotions': ['Manager', 'Admin'],
  '/reviews': ['Manager', 'Admin'],
  '/shipments': ['Manager', 'Admin'],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  console.log('Middleware chạy, path:', pathname);
  console.log('Token:', token);

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
      for (const [path, roles] of Object.entries(roleRequiredPaths)) {
        const pathRegex = new RegExp(`^${path}(/|$)`);
        if (pathRegex.test(pathname)) {
          if (typeof payload.role !== 'string' || !roles.includes(payload.role)) {
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
