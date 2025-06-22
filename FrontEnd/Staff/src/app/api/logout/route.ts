import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  const response = NextResponse.json({ message: 'Logout successful' });

  response.headers.set(
    'Set-Cookie',
    serialize('staff-token', '', {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })
  );

  return response;
}
