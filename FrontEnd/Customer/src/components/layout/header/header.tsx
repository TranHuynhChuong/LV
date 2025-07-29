'use client';
import AuthButtons from '@/components/layout/header/auth-buttons';
import CartButton from '@/components/layout/header/cart-button';
import Link from 'next/link';
import CategoryList from './category-list-button';
import SearchInput from './search-input';
import { Suspense } from 'react';
export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow md:static">
      <div className="container relative  mx-auto px-4 pt-4 flex flex-wrap flex-row max-[320px]:flex-col  space-y-4 md:space-y-0">
        <div className="order-1 w-1/2 max-[375px]:w-full md:order-1 md:w-auto font-bold text-3xl ">
          <Link href={'/'}>DẬT LẠC</Link>
        </div>
        <div className="order-2 pb-0 md:pb-4 w-1/2 max-[375px]:w-full text-right md:order-3 md:w-auto">
          <AuthButtons />
        </div>
        <div className="flex justify-between order-3 w-full pb-4 md:order-2 md:flex-1 md:mr-4 md:ml-8 md:pb-0">
          <div className="flex flex-1 h-full">
            <CategoryList />
            <div className="w-full h-full mx-2 md:mx-4 md:pb-4">
              <Suspense>
                <SearchInput />
              </Suspense>
            </div>
          </div>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
