import { cookies } from 'next/headers';
import axios from 'axios';

export async function AxiosServer() {
  const cookieStore = await cookies();
  const cookie = cookieStore.toString();

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API,
    headers: {
      Cookie: cookie,
    },
  });

  return api;
}
