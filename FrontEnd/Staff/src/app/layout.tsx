import './globals.css';
import type { Metadata } from 'next';
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

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.className} ${robotoSans.className} 
          font-sans text-base antialiased
          bg-zinc-100 text-zinc-900
          w-full h-screen flex flex-row relative `}
      >
        {children}
      </body>
    </html>
  );
}
