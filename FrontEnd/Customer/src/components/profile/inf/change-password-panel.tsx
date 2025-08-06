'use client';

import ChangePasswordForm from '@/components/auth/change-password-form';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/axios-client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ChangePasswordPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const router = useRouter();
  const { authData } = useAuth();
  const handleSendOtp = useCallback(async () => {
    if (!authData.userId) return;

    try {
      await api.post(`/auth/${authData.userId}/send-otp`);
      toast.success('Mã OTP đã được gửi đến email');

      setOtpCountdown(30);
    } catch {
      setError('Không thể gửi OTP');
    }
  }, [authData.userId]);

  useEffect(() => {
    handleSendOtp();
  }, [handleSendOtp]);

  useEffect(() => {
    if (otpCountdown === 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const handleResetPassword = async (values: {
    otp: string;
    password: string;
    confirmPassword: string;
  }) => {
    const { otp, password, confirmPassword } = values;
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (!authData.userId) return;
    try {
      setLoading(true);
      await api.put(`/auth/change-password/${authData.userId}`, {
        newPassword: password,
        otp,
      });

      toast.success('Cập nhật mật khẩu thành công');
      setError('');
      router.replace('/profile');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.response?.status === 422) {
        setError('Mã OTP không đúng hoặc hết hạn');
      } else {
        setError('Cập nhật mật khẩu thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg p-6 bg-white border rounded-md">
      <ChangePasswordForm
        mode="change"
        onSubmit={handleResetPassword}
        loading={loading}
        error={error}
        countdown={otpCountdown}
        onSendOtp={() => handleSendOtp()}
      />
    </div>
  );
}
