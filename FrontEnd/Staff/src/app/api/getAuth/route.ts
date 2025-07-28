import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  userId: string;
  role: number;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('staff-token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized: No token' }, { status: 401 });
    }
    const payload = jwtDecode<JwtPayload>(token);
    const now = Date.now() / 1000;
    if (payload.exp < now) {
      return NextResponse.json({ message: 'Unauthorized: Token expired' }, { status: 401 });
    }
    return NextResponse.json({
      userId: payload.userId,
      role: payload.role,
    });
  } catch {
    return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
  }
}
