'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios-client';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AddressForm, { AddressFormHandle } from '@/components/profile/address/address-form';

export default function AddressNew() {
  const router = useRouter();
  const formRef = useRef<AddressFormHandle>(null);
  const { authData } = useAuth();
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const handleSubmit = async () => {
    const data = await formRef.current?.submit();
    if (data) {
      const mapped = { ...data, customerId: authData.userId ?? undefined };
      api
        .post(`/addresses`, mapped)
        .then(() => {
          toast.success('Thêm thành công');
          router.back();
        })
        .catch(() => {
          toast.error('Thêm thất bại');
        });
    }
  };

  return (
    <div className="w-full p-6 space-y-6 bg-white border rounded-md shadow">
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="text-sm cursor-pointer" onClick={() => router.back()}>
          <ChevronLeft size={24} />
        </Button>
        <h1 className="text-lg font-semibold">Thêm thông tin nhận hàng</h1>
      </div>

      <AddressForm ref={formRef} />
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={() => router.back()} className="cursor-pointer">
          Hủy
        </Button>
        <Button onClick={() => setOpenAddDialog(true)} className="cursor-pointer">
          Thêm
        </Button>
      </div>
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận thêm</DialogTitle>
            <DialogDescription>Bạn có chắc muốn thêm thông tin nhận hàng này?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenAddDialog(false)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                setOpenAddDialog(false);
                handleSubmit();
              }}
              className="cursor-pointer"
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
