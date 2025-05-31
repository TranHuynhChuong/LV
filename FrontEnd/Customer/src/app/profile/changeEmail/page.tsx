'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/lib/axiosClient';
import { useAuth } from '@/contexts/AuthContext';

import { useRouter } from 'next/navigation';

export default function ChangeEmail() {
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const { authData } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = () => {
    if (!newEmail) {
      setError('Vui lòng nhập email mới');
      return;
    }

    api
      .post('/auth/send-otp', { email: newEmail })
      .then(() => {
        toast.success('Mã OTP đã được gửi đến email mới');
        setCountdown(30);
        setError('');
      })
      .catch((err) => {
        const message = err.response?.data?.message || 'Gửi OTP thất bại';
        setError(message);
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !otp) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    api
      .put(`/auth/change-email/${authData.userId}`, {
        newEmail: newEmail,
        otp,
      })
      .then(() => {
        toast.success('Email đã được cập nhật thành công');
      })
      .catch((err) => {
        const message = err.response?.data?.message || 'Cập nhật email thất bại';
        setError(message);
      });
  };

  return (
    <Card className="w-full md:max-w-md rounded-sm">
      <CardHeader className="mb-4">
        <CardTitle className="text-xl flex items-center">Thay đổi email</CardTitle>
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
            <p className="text-xs text-end text-muted-foreground mt-1">Gửi lại sau {countdown}s</p>
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
          />
        </div>
        <p className="text-sm text-red-500 text-center">{error}</p>
      </CardContent>
      <CardFooter className="flex justify-end items-center w-full space-x-4">
        <Button type="submit" onClick={handleSubmit}>
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
