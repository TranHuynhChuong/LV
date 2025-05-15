import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';
import router from 'next/router';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
  timeout: 10000,
  withCredentials: true, // Nếu cookie dùng chung cho tất cả request
});

// Request interceptor thêm access token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor auto refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { setAuth, clearAuth } = useAuthStore.getState();

    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await api.get('/auth/refresh-token', {
          withCredentials: true,
        });
        const { access_token, userId, role } = res.data;
        if (access_token) {
          setAuth(userId, access_token, role);
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${access_token}`,
          };
          return api(originalRequest); // Gọi lại request cũ
        }
      } catch (refreshError) {
        console.error('Refresh token error:', refreshError);
        clearAuth();
        if (typeof window !== 'undefined') {
          router.push('/login');
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
