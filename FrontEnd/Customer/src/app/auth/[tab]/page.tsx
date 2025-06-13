'use client';

import { useParams } from 'next/navigation';
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
    <div className="flex flex-col flex-1 justify-center items-center">
      {tab === 'login' && <Login />}
      {tab === 'register' && <Register />}
    </div>
  );
}
