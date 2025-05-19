'use client';

import { useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { login } from '@/services/authService';

export default function LoginForm({ onForgotPassword }: { readonly onForgotPassword: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra đơn giản
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);

      router.replace('/');
    } catch (err) {
      setError('Email / Mật khẩu không đúng');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }

    setError('');
  };

  return (
    <Card className="w-full shadow-lg">
      <form onSubmit={handleSubmit}>
        <CardHeader className="mb-6">
          <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pr-10 mt-2"
              disabled={loading}
            />
          </div>
          <div className="relative">
            <div className="flex justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
              <button
                type="button"
                className="hover:underline text-sm text-muted-foreground  cursor-pointer"
                onClick={onForgotPassword}
              >
                Quên mật khẩu?
              </button>
            </div>

            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-10 mt-2"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9.5 text-gray-500 hover:text-gray-800 cursor-pointer"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <div className="mt-2 text-red-500 text-sm text-center h-6">{error}</div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4 mt-6">
          <Button type="submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
