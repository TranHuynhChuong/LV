import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
  timeout: 10000,
  withCredentials: true, // Cookie sẽ tự gửi tự động
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { clearAuth } = useAuthStore.getState();
    const status = error.response?.status;

    console.log(status);
    if (status === 401) {
      clearAuth();
      return Promise.reject(new Error(error?.message ?? 'Unauthorized'));
    }

    return Promise.reject(new Error(error?.message ?? 'An error occurred'));
  }
);

export default api;
