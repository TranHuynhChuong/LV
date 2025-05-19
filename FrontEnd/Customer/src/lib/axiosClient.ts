import axios from 'axios';
import Router from 'next/router';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Nếu lỗi 401 Unauthorized hoặc 403 Forbidden thì logout
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      Router.push('/');
    }

    return Promise.reject(error);
  }
);

export default api;
