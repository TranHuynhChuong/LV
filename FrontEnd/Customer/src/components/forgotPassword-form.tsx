'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/axiosClient';

export default function ForgotPasswordForm({ onBackToLogin }: { onBackToLogin: () => void }) {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  const handleSendOtp = async () => {
    if (!email) {
      setError('Vui lòng nhập email trước khi gửi mã');
      return;
    }

    try {
      await api.post('/auth/send-otp', { email });
      setError('');
    } catch (err) {
      setError('Không thể gửi mã OTP');
      console.error('Gửi OTP lỗi:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const email = form.email.value;
    const otp = form.otp.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (!email || !otp || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setError('');
    console.log('✅ Reset mật khẩu với:', { email, otp, password });
  };

  return (
    <Card className="w-full  shadow-lg">
      <form onSubmit={handleSubmit}>
        <CardHeader className="mb-6">
          <CardTitle className="text-2xl text-center">Quên mật khẩu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSendOtp}
                className="cursor-pointer"
              >
                Gửi mã
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="otp">Mã OTP</Label>
            <Input id="otp" type="text" placeholder="Nhập mã OTP" required className="mt-2" />
          </div>

          <div className="relative">
            <Label htmlFor="password">Mật khẩu mới</Label>
            <Input
              id="password"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu mới"
              required
              className="mt-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-8 text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <div className="relative">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              required
              className="mt-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-8 text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <div className="text-red-500 text-sm text-center mt-2 h-4">{error}</div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4 mt-6">
          <Button type="submit">Xác nhận</Button>
          <button
            type="button"
            className="hover:underline text-sm text-muted-foreground  cursor-pointer"
            onClick={onBackToLogin}
          >
            Quay lại đăng nhập
          </button>
        </CardFooter>
      </form>
    </Card>
  );
}
