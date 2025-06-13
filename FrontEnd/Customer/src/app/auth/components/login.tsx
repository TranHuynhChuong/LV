'use client';

import { useState } from 'react';
import LoginForm from '@/app/auth/components/login-form';
import ForgotPasswordForm from '@/app/auth/components/forgotPassword-form';
export default function Login() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <div className="max-w-lg w-full">
      {showForgotPassword ? (
        <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />
      ) : (
        <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />
      )}
    </div>
  );
}
