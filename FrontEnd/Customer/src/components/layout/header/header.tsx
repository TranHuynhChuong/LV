import { ShoppingCart } from 'lucide-react';
import CategoryList from '@/components/layout/header/category-list';
import Account from '@/components/layout/header/account';
export default function Header() {
  return (
    <div className="w-full bg-zinc-800">
      <div className="container mx-auto w-full h-fit pt-3 pb-2 px-4 relative">
        <div className="flex  h-fit md:space-x-4 space-y-4 md:space-y-0 md:flex-row flex-col">
          <div className=" h-10">
            <div className="h-full w-full md:w-32 bg-zinc-50 flex items-center justify-center md:justify-start">
              LOGO
            </div>
          </div>
          <div className="md:flex-1 h-10 flex space-x-2 md:space-x-4 ">
            <CategoryList />
            <div className="flex flex-1 bg-zinc-50 "></div>
            <div className="flex w-fit h-full space-x-2 md:space-x-4 ">
              <div className="h-full w-fit flex flex-col justify-center items-center ">
                <ShoppingCart color="white" />
                <p className="hidden md:flex text-sm text-white">Giỏ hàng</p>
              </div>
              <Account />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
