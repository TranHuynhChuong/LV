import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const res = await fetch('/api/getAuth', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          config.headers['Authorization'] = `Bearer ${data.token}`;
        }
      }
    } catch (e) {
      console.log(e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401 || status === 403) {
        await fetch('/api/logout', { method: 'POST' });
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
