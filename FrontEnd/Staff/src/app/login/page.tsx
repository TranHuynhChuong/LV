/* eslint-disable @typescript-eslint/no-unused-vars */
// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Quan trọng để nhận cookie từ BE
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error('Đăng nhập thất bại');
      }

      const data = await res.json();

      console.log('Login data:', data); // Kiểm tra dữ liệu trả về từ server

      // Lưu vào zustand store
      useAuthStore.getState().setAuth(data.userId, data.accessToken, data.role);

      if (data.role === 'admin') {
        router.push('/admin');
      } else if (data.role === 'manager') {
        router.push('/manager');
      } else if (data.role === 'sale') {
        router.push('/sale');
      } else throw new Error('Không có quyền truy cập');
    } catch (err) {
      setError('Sai email hoặc mật khẩu');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white px-12 py-16 rounded-lg shadow-md w-lg">
        <h2 className="text-3xl font-bold text-left mb-8">Đăng nhập</h2>

        <div className="flex flex-col space-y-4 w-full">
          <div className="flex flex-col">
            <label htmlFor="username" className="text-sm font-semibold text-gray-700 mb-2">
              Tên đăng nhập
            </label>
            <input
              type="username"
              id="username"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2 border-1 rounded-md border-gray-300"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="pass" className="text-sm font-semibold text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              id="pass"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2 border-1 rounded-md"
              required
            />
          </div>
        </div>

        <div className="h-4 flex justify-center items-center my-4">
          <p className="text-red-500 text-sm text-center">{error}</p>
        </div>

        <button
          type="submit"
          className="w-full bg-gray-800 text-white py-2 mt-4 rounded-lg hover:bg-gray-900"
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
