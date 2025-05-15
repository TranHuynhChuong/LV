// app/login/layout.tsx
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased w-full p-10 bg-zinc-100 min-h-screen flex items-center justify-center`}
    >
      {/* Form login nằm giữa, khối đẹp */}
      <div className="w-lg p-8 bg-white rounded-xl shadow-md">{children}</div>
    </div>
  );
}
