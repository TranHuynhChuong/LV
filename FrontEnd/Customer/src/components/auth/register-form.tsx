'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const router = useRouter();
  const { loadAuth } = useAuth();

  const [otpCountdown, setOtpCountdown] = useState(0);

  useEffect(() => {
    if (otpCountdown === 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const handleSendOtp = async () => {
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    try {
      await api.post('/auth/send-otp', { email });
      setError('');
      toast.success('Mã OTP đã được gửi đến email');

      setOtpCountdown(30);
    } catch (err) {
      setError('Không thể gửi mã OTP');
      console.error('Gửi OTP lỗi:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement)?.value;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
    const otp = (form.elements.namedItem('otp') as HTMLInputElement)?.value;
    const password = (form.elements.namedItem('password') as HTMLInputElement)?.value;
    const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement)?.value;

    if (!name || !email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', {
        otp: otp,
        name: name,
        email: email,
        password: password,
      });
      await loadAuth();
      router.replace('/auth/login');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setError('Email đã được đăng ký');
      } else if (err?.response?.status === 422) {
        setError('Mã OTP không đúng hoặc hết hạn');
      } else {
        setError('Đăng ký thất bại');
      }
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg m-auto shadow-lg">
      <form onSubmit={handleSubmit}>
        <CardHeader className="mb-6">
          <CardTitle className="text-2xl text-center">Đăng ký</CardTitle>
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
              <div>
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
            <p className="text-xs text-end mt-2 text-zinc-600">
              {otpCountdown > 0 ? `Gửi lại sau ${otpCountdown}s` : ''}
            </p>
          </div>
          <div>
            <Label htmlFor="otp">Mã OTP</Label>
            <Input id="otp" type="text" placeholder="Nhập mã OTP" required className="mt-2" />
          </div>
          <div>
            <Label htmlFor="name">Họ tên</Label>
            <Input
              id="name"
              type="text"
              placeholder="Nguyễn Văn A"
              required
              className="mt-2"
              disabled={loading}
            />
          </div>

          <div className="relative">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              required
              className="mt-2 pr-10"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-500 hover:text-gray-800"
              disabled={loading}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
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
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-8 text-gray-500 hover:text-gray-800"
            >
              {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <div className="text-red-500 text-sm text-center mt-2 h-4">{error}</div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4 mt-6">
          <Button type="submit" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </Button>
          <div className="flex justify-center items-center text-sm gap-2 ">
            <p>Đã có có tài khoản ? </p>
            <Link href={'/auth/login'} className="hover:underline underline">
              Đăng nhập
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
