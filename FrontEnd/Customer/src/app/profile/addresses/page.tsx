'use client';

import { Button } from '@/components/ui/button';
import AddressList from '@/components/profiles/addresses/AddressList';
import Link from 'next/link';

export default function AddressPage() {
  return (
    <div className="w-full p-6 border bg-white shadow rounded-md space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Thông tin nhận hàng</h1>
        <Link href={'/profile/addresses/new'} className="h-fit">
          <Button className="text-sm cursor-pointer hidden sm:flex">+ Thêm địa chỉ mới</Button>
        </Link>
      </div>

      <AddressList />

      <div className="justify-end flex sm:hidden">
        <Link href={'/profile/addresses/new'} className="h-fit">
          <Button className="text-sm cursor-pointer ">+ Thêm địa chỉ mới</Button>
        </Link>
      </div>
    </div>
  );
}
