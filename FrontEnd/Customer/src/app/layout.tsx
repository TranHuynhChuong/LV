import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/header/header';
import Footer from '@/components/layout/footer/footer';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';

import { Roboto, Geist } from 'next/font/google';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geistSans',
});

const robotoSans = Roboto({
  subsets: ['latin'],
  variable: '--font-robotoSans',
});

export const metadata: Metadata = {
  title: 'Dật Lạc',
  description: '',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <body
          className={`${geistSans.className} ${robotoSans.className} font-sans text-base antialiased
          bg-zinc-100 text-zinc-900
          w-full min-h-screen h-full flex flex-col relative overflow-y-auto isolate`}
        >
          <Header />
          <main className="container mx-auto flex-1 flex flex-col w-full p-4">{children}</main>
          <Footer />
          <Toaster richColors position="top-right" duration={2000} />
        </body>
      </html>
    </AuthProvider>
  );
}
