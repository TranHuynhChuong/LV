import AuthButtons from '@/components/layout/header/authButtons';
import CartButton from '@/components/layout/header/cartButton';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="shadow sticky top-0 bg-white z-40">
      <div className="container mx-auto p-4 flex flex-wrap  space-y-4 md:space-y-0">
        {/* 1 */}
        <div className="order-1 w-1/2 md:order-1 md:w-auto font-bold text-2xl">
          <Link href={'/'}>DẬT LẠC</Link>
        </div>

        {/* 3 */}
        <div className="order-2 w-1/2 text-right md:order-3 md:w-auto">
          <AuthButtons />
        </div>

        {/* 2 */}
        <div className="order-3 w-full md:order-2 md:flex-1 justify-between  flex md:mr-4 md:ml-8">
          <div className="flex flex-1">
            <div className="w-fit">Category</div>
            <div className="w-full mx-4">Search</div>
          </div>

          <CartButton quantity={3} />
        </div>
      </div>
    </header>
  );
}
