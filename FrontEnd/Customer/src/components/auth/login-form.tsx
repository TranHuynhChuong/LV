'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type LoginFormProps = {
  onForgotPassword: () => void;
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
  error?: string;
};

export default function LoginForm({
  onForgotPassword,
  onSubmit,
  loading = false,
  error = '',
}: Readonly<LoginFormProps>) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
        </CardHeader>
        <CardContent className="mt-6 mb-4 space-y-4">
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
                className="text-sm cursor-pointer hover:underline text-muted-foreground"
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

          <div className="h-4 text-sm text-center text-red-500">{error}</div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4">
          <Button type="submit" disabled={loading} className="cursor-pointer">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
          <div className="flex items-center justify-center gap-2 text-sm">
            <p>Chưa có tài khoản?</p>
            <Link href="/register" className="underline hover:underline">
              Đăng ký
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
