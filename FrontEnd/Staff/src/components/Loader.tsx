export default function Loader() {
  return (
    <div className="fixed inset-0 bg-zinc-50/70 flex items-center justify-center z-50 rounded-lg">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4  border-x-zinc-400  rounded-full animate-spin animate-ease-in-out" />
        <div className="absolute inset-2 border-4  border-x-zinc-400  rounded-full animate-spin animate-ease-in-out" />
      </div>
    </div>
  );
}
