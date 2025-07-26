'use client';

import AddressList from '@/components/profile/address/address-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AddressPage() {
  return (
    <div className="w-full p-6 space-y-6 bg-white border rounded-md shadow">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Thông tin nhận hàng</h1>
        <Link href={'/profile/address/new'} className="h-fit">
          <Button className="hidden text-sm cursor-pointer sm:flex">+ Thêm địa chỉ mới</Button>
        </Link>
      </div>

      <AddressList />

      <div className="flex justify-end sm:hidden">
        <Link href={'/profile/address/new'} className="h-fit">
          <Button className="text-sm cursor-pointer ">+ Thêm địa chỉ mới</Button>
        </Link>
      </div>
    </div>
  );
}
