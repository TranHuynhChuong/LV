'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

import api from '@/lib/axios';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import AddressForm, { AddressFormHandle } from '@/components/profile/address/address-form';
import { Address, mapAddressListFromDto, mapAddressToDto } from '@/models/address';

export default function AddressDetailPage() {
  const router = useRouter();
  const { addressId } = useParams();
  const formRef = useRef<AddressFormHandle>(null);
  const [defaultData, setDefaultData] = useState<Address>();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const { authData } = useAuth();

  useEffect(() => {
    if (!authData.userId) return;
    if (addressId) {
      api
        .get(`/addresses/${authData.userId}/${addressId}`)
        .then(async (res) => {
          const mapped = await mapAddressListFromDto([res.data]);
          setDefaultData(mapped[0] || null);
        })
        .catch(() => {
          toast.error('Không tìm thấy địa chỉ');
          router.back();
        });
    }
  }, [addressId, authData.userId]);

  // Handle update
  const handleUpdate = async () => {
    const data = await formRef.current?.submit();
    if (data) {
      const mapped = mapAddressToDto(data, authData.userId ?? undefined);

      api
        .put(`/addresses/${authData.userId}/${addressId}`, mapped)
        .then(() => {
          toast.success('Cập nhật thành công');
          router.back();
        })
        .catch(() => {
          toast.error('Cập nhật thất bại');
        });
    }
  };

  // Handle delete
  const handleDelete = () => {
    api
      .delete(`/addresses/${authData.userId}/${addressId}`)
      .then(() => {
        toast.success('Xóa thành công');
        router.back();
      })
      .catch(() => {
        toast.error('Xóa thất bại');
      });
  };

  return (
    <div className="w-full p-6 space-y-6 bg-white border rounded-md shadow">
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="text-sm cursor-pointer" onClick={() => router.back()}>
          <ChevronLeft size={24} />
        </Button>
        <h1 className="text-lg font-semibold">Chi tiết thông tin nhận hàng</h1>
      </div>

      {defaultData && <AddressForm ref={formRef} defaultValue={defaultData} />}

      <div className="flex justify-end pt-4 border-t">
        <div className="flex gap-2">
          <Button onClick={() => setOpenDeleteDialog(true)}>Xóa</Button>
          <Button onClick={() => setOpenUpdateDialog(true)}>Cập nhật</Button>
          <Button variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </div>

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription> Bạn chắc chắn muốn xóa thông tin nhận hàng này?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Confirm Update Dialog */}
      <Dialog open={openUpdateDialog} onOpenChange={setOpenUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận cập nhật</DialogTitle>
            <DialogDescription> Bạn có chắc muốn cập nhật thông tin này?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenUpdateDialog(false)}>
              Hủy
            </Button>
            <Button
              onClick={() => {
                setOpenUpdateDialog(false);
                handleUpdate();
              }}
            >
              Xác nhận cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
