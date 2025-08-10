import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  userId: string;
  role: number;
}

const roleRequiredPaths: Record<string, number[]> = {
  '/accounts': [1],
  '/books': [1, 2],
  '/categories': [1, 2],
  '/promotions': [1, 2],
  '/reviews': [1, 2],
  '/shipping': [1, 2],
  '/stats': [1, 2],
};

function redirectWithTokenClear(req: NextRequest, path: string) {
  const res = NextResponse.redirect(new URL(path, req.url));
  res.cookies.set('staff-token', '', { maxAge: 0 });
  return res;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('staff-token')?.value;

  if (!token && pathname !== '/login') {
    return redirectWithTokenClear(req, '/login');
  }

  if (token) {
    try {
      const payload = jwtDecode<JwtPayload>(token);
      const now = Date.now() / 1000;
      if (payload.exp < now) {
        if (pathname !== '/login') {
          return redirectWithTokenClear(req, '/login');
        }
      }

      for (const [protectedPath, allowedRoles] of Object.entries(roleRequiredPaths)) {
        const pathRegex = new RegExp(`^${protectedPath}(/|$)`);
        if (pathRegex.test(pathname)) {
          if (!allowedRoles.includes(payload.role)) {
            const referer = req.headers.get('referer') || '/';
            return NextResponse.redirect(new URL(referer, req.url));
          }
        }
      }
    } catch {
      if (pathname !== '/login') {
        return redirectWithTokenClear(req, '/login');
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|login|public|favicon.ico).*)'],
};
