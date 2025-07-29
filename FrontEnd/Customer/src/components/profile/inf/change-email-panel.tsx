'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/axios-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ChangeEmailPanel() {
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const { authData } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!authData.userId) return;

    try {
      await api.post(`/auth/${authData.userId}/send-otp`);
      toast.success('Mã OTP đã được gửi đến email');

      setCountdown(30);
    } catch {
      setError('Không thể gửi OTP');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !otp) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    api
      .put(`/auth/change-email/${authData.userId}`, {
        newEmail: newEmail,
        otp,
      })
      .then(() => {
        toast.success('Email đã được cập nhật thành công');
      })
      .catch((error) => {
        if (error?.response?.status === 422) {
          setError('Mã OTP không đúng hoặc hết hạn');
        } else {
          setError('Cập nhật email thất bại');
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <Card className="w-full max-w-lg bg-white border rounded-md">
      <CardHeader className="mb-4">
        <CardTitle className="flex items-center text-xl">Thay đổi email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="newEmail">Email mới</Label>
          <div className="flex gap-2">
            <Input
              id="newEmail"
              type="email"
              placeholder="you@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={loading}
            />
            <Button
              type="button"
              variant="outline"
              disabled={countdown > 0}
              onClick={handleSendOtp}
            >
              Gửi mã
            </Button>
          </div>
          {countdown > 0 && (
            <p className="mt-1 text-xs text-end text-muted-foreground">Gửi lại sau {countdown}s</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="otp">Mã OTP</Label>
          <Input
            id="otp"
            type="text"
            placeholder="Nhập mã xác thực"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={loading}
          />
        </div>
        <p className="text-sm text-center text-red-500">{error}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-end w-full space-x-4">
        <Button type="submit" onClick={handleSubmit} disabled={loading}>
          Xác nhận thay đổi
        </Button>
        <Button
          className="cursor-pointer"
          variant={'outline'}
          onClick={() => router.push('/profile')}
        >
          Hủy
        </Button>
      </CardFooter>
    </Card>
  );
}
