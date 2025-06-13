import AuthButtons from '@/components/layout/header/authButtons';
import CartButton from '@/components/layout/header/cartButton';
import Link from 'next/link';
import CategoryList from './categoryListButton';
import SearchInput from './searchInput';

export default function Header() {
  return (
    <header className="shadow sticky top-0 bg-white z-40">
      <div className="container relative  mx-auto p-4 flex flex-wrap flex-row max-[320px]:flex-col  space-y-4 md:space-y-0">
        {/* 1 */}
        <div className="order-1 w-1/2 max-[375px]:w-full md:order-1 md:w-auto font-bold text-2xl ">
          <Link href={'/'}>DẬT LẠC</Link>
        </div>

        {/* 3 */}
        <div className="order-2 pb-0 md:pb-4 w-1/2 max-[375px]:w-full text-right md:order-3 md:w-auto">
          <AuthButtons />
        </div>

        {/* 2 */}
        <div className="order-3  w-full md:order-2 md:flex-1 justify-between  flex md:mr-4 md:ml-8 pb-4 md:pb-0">
          <div className="flex flex-1 h-full">
            <CategoryList />
            <div className="w-full h-full mx-2 md:mx-4 md:pb-4">
              <SearchInput />
            </div>
          </div>

          <CartButton />
        </div>
      </div>
    </header>
  );
}
