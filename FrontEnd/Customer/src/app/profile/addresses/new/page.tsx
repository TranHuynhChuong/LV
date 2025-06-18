'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import AddressForm, { AddressFormHandle } from '../components/addressForm';
import { mapAddressToApi } from '@/types/address';

export default function NewAddressPage() {
  const router = useRouter();
  const formRef = useRef<AddressFormHandle>(null);

  const handleSubmit = async () => {
    const data = await formRef.current?.submit();
    if (data) {
      console.log('📦 Dữ liệu nhận được:', data);
      const mapped = mapAddressToApi({
        ...data,
        province: { id: data.provinceId },
        ward: { id: data.wardId },
      });

      console.log(mapped);
    }
  };

  return (
    <div className="w-full p-6 bg-white shadow rounded-md space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="text-sm cursor-pointer" onClick={() => router.back()}>
          <ChevronLeft size={24} />
        </Button>
        <h1 className="text-lg font-semibold">Thêm thông tin nhận hàng</h1>
      </div>

      {/* Form */}
      <AddressForm ref={formRef} />

      {/* Nút hành động */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={() => router.back()}>
          Hủy
        </Button>
        <Button onClick={handleSubmit}>Thêm</Button>
      </div>
    </div>
  );
}
