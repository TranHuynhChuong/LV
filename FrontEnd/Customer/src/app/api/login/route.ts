import { NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  userId: string;
  role: string;
  exp: number;
  [key: string]: unknown;
}

export async function POST(request: Request) {
  try {
    const { code, pass } = await request.json();

    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/login-customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, pass }),
    });

    if (!backendRes.ok) {
      const error = await backendRes.json();
      return NextResponse.json(
        { message: error.message || 'Login failed' },
        { status: backendRes.status }
      );
    }

    const { token } = await backendRes.json();

    // Giải mã token để lấy userId, role
    let userId = null;
    let role = null;
    try {
      const payload = jwtDecode<JwtPayload>(token);
      userId = payload.userId;
      role = payload.role;
    } catch {}

    const response = NextResponse.json({
      message: 'Login successful',
      userId,
      role,
    });

    response.headers.set(
      'Set-Cookie',
      serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 6,
        path: '/',
      })
    );

    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
