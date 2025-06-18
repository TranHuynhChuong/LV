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
    const { email, pass } = await request.json();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/login-customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pass }),
    });

    if (!res.ok) {
      return NextResponse.json({ message: 'Đăng nhập thất bại' }, { status: res.status });
    }

    const { token } = await res.json();

    // Giải mã token để lấy userId, role
    let userId = null;
    try {
      const payload = jwtDecode<JwtPayload>(token);
      userId = payload.userId;
    } catch {}

    const response = NextResponse.json({
      message: 'Login successful',
      email: userId,
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
