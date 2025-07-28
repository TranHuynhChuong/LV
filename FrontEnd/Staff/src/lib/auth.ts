'use server';

import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

type JwtPayload = {
  exp: number;
  userId: string;
  role: number;
};

export async function getAuth(): Promise<{ userId: string; role: number } | null> {
  try {
    const token = (await cookies()).get('staff-token')?.value;
    if (!token) return null;
    const payload = jwtDecode<JwtPayload>(token);
    const now = Date.now() / 1000;
    if (payload.exp < now) return null;
    return {
      userId: payload.userId,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
