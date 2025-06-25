import axios from 'axios';

const api = axios.create({
  baseURL: '/api/proxy/',
  timeout: 5000,
});

export default api;
