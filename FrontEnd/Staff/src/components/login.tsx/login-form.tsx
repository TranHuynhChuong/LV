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

export default function LoginForm() {
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
        await res.json();

        if (res.status === 401) {
          setServerError('Mã đăng nhập / Mật khẩu không đúng');
        } else {
          setServerError('Lỗi đăng nhập!');
        }

        return;
      }
      const { role } = await res.json();

      if (role === 3) router.push('/orders');
      else router.push('/');
    } catch {
      setServerError('Lỗi đăng nhập!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <h1 className="mb-16 text-2xl font-bold text-center">Đăng nhập</h1>
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

        <div className="w-full h-10">
          {serverError && (
            <p className="text-sm font-medium text-center text-red-600">{serverError}</p>
          )}
        </div>

        <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>
    </Form>
  );
}
