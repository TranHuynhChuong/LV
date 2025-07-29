import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      if (typeof window !== 'undefined') window.location.reload();
    }
    return Promise.reject(err);
  }
);
export default api;
