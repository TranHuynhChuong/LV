'use client';

import { useEffect, useState } from 'react';
import LoginForm from '@/components/auth/login-form';
import ChangePasswordForm from '@/components/auth/changePasswordForm';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function LoginPage() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);

  const router = useRouter();
  const { loadAuth } = useAuth();

  useEffect(() => {
    if (otpCountdown === 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // 👉 Đăng nhập
  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pass: password }),
      });

      if (!res.ok) {
        await res.json();
        throw new Error('Email / Mật khẩu không đúng');
      }

      await loadAuth();
      router.push('/');
    } catch (error) {
      console.error(error);
      setError('Email / Mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  // 👉 Gửi OTP
  const handleSendOtp = async (targetEmail: string) => {
    if (!targetEmail) {
      setError('Vui lòng nhập email');
      return;
    }
    setError('');
    try {
      await api.post('/auth/send-otp', { email: targetEmail });
      toast.success('Mã OTP đã được gửi đến email');

      setOtpCountdown(30);
    } catch (error) {
      console.error(error);
      setError('Không thể gửi OTP');
    }
  };

  // 👉 Quên / Đổi mật khẩu
  const handleResetPassword = async (values: {
    email: string;
    otp: string;
    password: string;
    confirmPassword: string;
  }) => {
    const { email, otp, password, confirmPassword } = values;
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    setError('');

    try {
      setLoading(true);
      await api.put(`/auth/forgot-password`, {
        email,
        newPassword: password,
        otp,
      });

      toast.success('Cập nhật mật khẩu thành công');
      setShowForgotPassword(false);
      setError('');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setError('Email chưa được đăng ký');
      } else if (error?.response?.status === 422) {
        setError('Mã OTP không đúng hoặc hết hạn');
      } else {
        setError('Cập nhật mật khẩu thất bại');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg w-full mx-auto my-10">
      {showForgotPassword ? (
        <div className="bg-white rounded-md shadow border p-6">
          <h2 className="text-xl font-semibold text-center mb-8">Quên mật khẩu</h2>
          <ChangePasswordForm
            mode="forgot"
            onBackToLogin={() => setShowForgotPassword(false)}
            onSubmit={handleResetPassword}
            loading={loading}
            error={error}
            countdown={otpCountdown}
            onSendOtp={(email) => handleSendOtp(email)}
          />
        </div>
      ) : (
        <LoginForm
          onForgotPassword={() => setShowForgotPassword(true)}
          onSubmit={handleLogin}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
}
