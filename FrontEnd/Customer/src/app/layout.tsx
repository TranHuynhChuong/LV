import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/header/header';
import Footer from '@/components/layout/footer/footer';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { Roboto, Geist } from 'next/font/google';
import RouteWatcher from '@/components/utils/route-watcher';
import RasaWidget from '@/chatbot/rasa-widget';

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
          <RouteWatcher />
          <Header />
          <main className="container flex flex-col flex-1 w-full min-h-screen p-4 mx-auto">
            {children}
          </main>
          <Footer />
          <Toaster richColors position="bottom-right" duration={2000} />
          <RasaWidget />
        </body>
      </html>
    </AuthProvider>
  );
}
