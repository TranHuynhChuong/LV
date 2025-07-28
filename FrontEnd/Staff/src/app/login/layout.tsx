export default function LoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="p-8 bg-white shadow-md w-lg rounded-xl">{children}</div>
    </div>
  );
}
