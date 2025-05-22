import AuthButtons from '@/components/layout/header/authButtons';
import CartButton from '@/components/layout/header/cartButton';

export default function Header() {
  return (
    <header className="shadow">
      <div className="container mx-auto p-4 flex flex-wrap items-center space-y-4 md:space-y-0">
        {/* 1 */}
        <div className="order-1 w-1/2 md:order-1 md:w-auto">Logo</div>

        {/* 3 */}
        <div className="order-2 w-1/2 text-right md:order-3 md:w-auto">
          <AuthButtons />
        </div>

        {/* 2 */}
        <div className="order-3 w-full md:order-2 md:flex-1 justify-between items-center flex md:mx-4">
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
