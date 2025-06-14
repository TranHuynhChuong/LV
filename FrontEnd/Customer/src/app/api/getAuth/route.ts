import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  userId: string;
  role: number;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      throw new Error();
    }

    const payload = jwtDecode<JwtPayload>(token);

    const now = Date.now() / 1000;
    if (payload.exp < now) {
      throw new Error();
    }

    return NextResponse.json({
      userEmail: payload.userId,
      token,
    });
  } catch {
    return NextResponse.json({
      userEmail: null,
      token: null,
    });
  }
}
