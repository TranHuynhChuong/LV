import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/header/header';
import Footer from '@/components/layout/footer/footer';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-roboto',
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
        <body className={`${roboto.className} antialiased min-h-screen flex flex-col`}>
          <Header />
          <main className="container mx-auto flex-1 w-full p-4">{children}</main>
          <Toaster richColors position="top-right" duration={2000} />
          <Footer />
        </body>
      </html>
    </AuthProvider>
  );
}
