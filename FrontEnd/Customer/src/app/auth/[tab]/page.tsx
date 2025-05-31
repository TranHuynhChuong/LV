'use client';

import { useParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import Login from '../components/login';
import Register from '../components/register';

export default function AuthPage() {
  const params = useParams();
  const tabParam = params.tab as string;

  const [tab, setTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (tabParam === 'register') {
      setTab('register');
    } else {
      setTab('login');
    }
  }, [tabParam]);

  return (
    <div className="flex w-full justify-center ">
      <div className="w-full max-w-lg">
        <Tabs value={tab} onValueChange={(value) => setTab(value as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Đăng nhập</TabsTrigger>
            <TabsTrigger value="register">Đăng ký</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Login />
          </TabsContent>
          <TabsContent value="register">
            <Register />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
