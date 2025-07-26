'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

type ChangePasswordFormProps = {
  countdown: number;
  onBackToLogin?: () => void;
  onSendOtp: (email: string) => void;
  onSubmit: (values: {
    email: string;
    otp: string;
    password: string;
    confirmPassword: string;
  }) => void;
  error?: string;
  mode: 'change' | 'forgot';
  loading?: boolean;
};

export default function ChangePasswordForm({
  countdown,
  onSendOtp,
  onSubmit,
  error,
  mode,
  onBackToLogin,
  loading,
}: Readonly<ChangePasswordFormProps>) {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;

    const otp = form.otp.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    onSubmit({ email, otp, password, confirmPassword });
  };

  const handleSendOtp = () => {
    onSendOtp(email);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'forgot' && (
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="flex items-center gap-2 mt-2">
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSendOtp}
              disabled={countdown > 0}
              className="cursor-pointer"
            >
              Gửi mã
            </Button>
          </div>
          <p className="mt-2 text-xs text-end text-zinc-600">
            {countdown > 0 ? `Gửi lại sau ${countdown}s` : ''}
          </p>
        </div>
      )}

      {mode === 'change' && (
        <div>
          <Label htmlFor="otp">Mã OTP</Label>
          <div className="flex items-center gap-2 mt-2">
            <Input id="otp" type="text" placeholder="Nhập mã OTP" required disabled={loading} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSendOtp}
              disabled={countdown > 0}
              className="cursor-pointer"
            >
              Gửi mã
            </Button>
          </div>
          <p className="mt-2 text-xs text-end text-zinc-600">
            {countdown > 0 ? `Gửi lại sau ${countdown}s` : ''}
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="otp">Mã OTP</Label>
        <Input
          id="otp"
          type="text"
          placeholder="Nhập mã OTP"
          required
          className="mt-2"
          disabled={loading}
        />
      </div>

      <div className="relative">
        <Label htmlFor="password">Mật khẩu mới</Label>
        <Input
          id="password"
          type={showNewPassword ? 'text' : 'password'}
          placeholder="Nhập mật khẩu mới"
          required
          className="pr-10 mt-2"
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => setShowNewPassword(!showNewPassword)}
          className="absolute text-gray-500 cursor-pointer right-3 top-8 hover:text-gray-800"
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
          className="pr-10 mt-2"
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute text-gray-500 cursor-pointer right-3 top-8 hover:text-gray-800"
        >
          {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>

      <div className="h-4 mt-2 text-sm text-center text-red-500">{error}</div>

      <Button type="submit" className="w-full" disabled={loading}>
        Xác nhận
      </Button>

      {mode === 'forgot' && onBackToLogin && (
        <button
          type="button"
          className="w-full mt-2 text-sm text-center hover:underline text-muted-foreground"
          onClick={onBackToLogin}
        >
          Quay lại đăng nhập
        </button>
      )}
    </form>
  );
}
