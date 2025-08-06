'use client';
import ChangePasswordForm from '@/components/auth/change-password-form';
import LoginForm from '@/components/auth/login-form';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/axios-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function LoginPanel() {
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
    } catch {
      setError('Email / Mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (targetEmail: string) => {
    if (!targetEmail) {
      setError('Vui lòng nhập email');
      return;
    }
    setError('');
    try {
      await api.post('/auth/send-otp', { email: targetEmail, isNew: false });
      toast.success('Mã OTP đã được gửi đến email');

      setOtpCountdown(30);
    } catch {
      setError('Không thể gửi OTP');
    }
  };

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto my-10">
      {showForgotPassword ? (
        <div className="p-6 bg-white border rounded-md shadow">
          <h2 className="mb-8 text-xl font-semibold text-center">Quên mật khẩu</h2>
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
