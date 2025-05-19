'use client';

import { useState } from 'react';
import LoginForm from '@/components/login-form';
import ForgotPasswordForm from '@/components/forgotPassword-form';
export default function Login() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <div className="flex  w-full items-center justify-center">
      <div className="w-full">
        {showForgotPassword ? (
          <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />
        ) : (
          <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />
        )}
      </div>
    </div>
  );
}
