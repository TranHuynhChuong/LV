'use client';

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
  timeout: 10000,
});

export default api;
