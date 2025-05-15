'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/useAuthStore';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type LoginFormInputs = {
  code: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginFormInputs>({
    defaultValues: {
      code: '',
      password: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormInputs) => {
    if (!data.code || !data.password) {
      // Trường code hoặc password rỗng thì không làm gì
      return;
    }

    setServerError(null);
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/login-staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: data.code, pass: data.password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const msg = errData?.message || 'Đăng nhập thất bại';
        throw new Error(msg);
      }

      const result = await res.json();

      useAuthStore.getState().setAuth(result.userId, result.access_token, result.role);
      router.replace('/');
    } catch (err) {
      setServerError('Mã đăng nhập / Mật khẩu không đúng');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <h1 className="text-2xl font-bold text-center mb-16">Đăng nhập</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã đăng nhập</FormLabel>
              <FormControl>
                <Input placeholder="Mã đăng nhập" {...field} disabled={loading} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Mật khẩu" {...field} disabled={loading} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="h-10 w-full">
          {serverError && (
            <p className="text-sm font-medium text-red-600 text-center">{serverError}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>
    </Form>
  );
}
