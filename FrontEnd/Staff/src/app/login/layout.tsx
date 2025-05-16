// app/login/layout.tsx

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="w-lg p-8 bg-white rounded-xl shadow-md">{children}</div>
    </div>
  );
}
