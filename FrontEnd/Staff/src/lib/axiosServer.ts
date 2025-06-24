import axios from 'axios';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const axiosServer = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
  timeout: 5000,
});

axiosServer.interceptors.request.use(async (config) => {
  const token = (await cookies()).get('staff-token')?.value;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

axiosServer.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      (await cookies()).delete('staff-token');

      redirect('/login');
    }
    return Promise.reject(error);
  }
);

export default axiosServer;
