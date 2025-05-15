/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import router from 'next/router';

const api = axios.create({
  baseURL: process.env.API,
  timeout: 10000,
});

// ✅ Request interceptor
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

// ✅ Response interceptor: auto refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { setAuth, clearAuth } = useAuthStore.getState();

    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (status === 401 || status === 403) {
      // Nếu token hết hạn thì thử refresh
      if (code === 'EXPIRED_TOKEN') {
        try {
          const res = await api.get('/auth/refresh-accesstoken', {
            withCredentials: true,
          });
          const { accessToken, userId } = res.data;
          if (accessToken) {
            setAuth(userId, accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest); // gửi lại request
          }
        } catch (refreshError) {
          clearAuth();
          if (typeof window !== 'undefined') {
            router.push('/login');
          }
        }
      } else {
        // Nếu là không có quyền luôn thì logout
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
