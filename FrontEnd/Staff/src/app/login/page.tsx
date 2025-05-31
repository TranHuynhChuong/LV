'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
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
      return;
    }

    setServerError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: data.code, pass: data.password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Login failed:', errorData.message);

        if (res.status === 401) {
          setServerError('Mã đăng nhập / Mật khẩu không đúng');
        } else {
          setServerError('Đã xảy ra lỗi!');
        }

        return;
      }

      const resData = await res.json();

      // Lưu userId và role vào localStorage
      if (resData.userId && resData.role) {
        localStorage.setItem('userId', resData.userId);
        localStorage.setItem('role', resData.role);
      }

      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      setServerError('Đã xảy ra lỗi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <h1 className="text-2xl font-bold text-center mb-16">Đăng nhập</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-6"
        noValidate
      >
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
