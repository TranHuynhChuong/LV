'use client';

import { useState } from 'react';
import LoginForm from '@/app/auth/components/login-form';
import ChangePassword from '@/app/auth/components/changePassword';
export default function Login() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <div className="max-w-lg w-full">
      {showForgotPassword ? (
        <ChangePassword mode="forgot" onBackToLogin={() => setShowForgotPassword(false)} />
      ) : (
        <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />
      )}
    </div>
  );
}
