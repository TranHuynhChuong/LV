'use client';

import AddressForm, { AddressFormHandle } from '@/components/profile/address/address-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/axios-client';
import { Address, mapAddressListFromDto, mapAddressToDto } from '@/models/address';
import { ChevronLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function AddressDetail() {
  const router = useRouter();
  const { id } = useParams();
  const formRef = useRef<AddressFormHandle>(null);
  const [defaultData, setDefaultData] = useState<Address>();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const { authData } = useAuth();

  useEffect(() => {
    if (!authData.userId || !id) return;
    if (id) {
      api
        .get(`/addresses/${authData.userId}/${id}`)
        .then(async (res) => {
          const mapped = await mapAddressListFromDto([res.data]);
          setDefaultData(mapped[0] || null);
        })
        .catch(() => {
          toast.error('Không tìm thấy địa chỉ');
          router.back();
        });
    }
  }, [id, authData.userId, router]);

  const handleUpdate = async () => {
    const data = await formRef.current?.submit();
    if (data) {
      const mapped = mapAddressToDto(data, authData.userId ?? undefined);

      api
        .put(`/addresses/${authData.userId}/${id}`, mapped)
        .then(() => {
          toast.success('Cập nhật thành công');
          router.back();
        })
        .catch(() => {
          toast.error('Cập nhật thất bại');
        });
    }
  };

  const handleDelete = () => {
    api
      .delete(`/addresses/${authData.userId}/${id}`)
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
          <Button
            variant="destructive"
            onClick={() => setOpenDeleteDialog(true)}
            className="cursor-pointer"
          >
            Xóa
          </Button>
          <Button onClick={() => setOpenUpdateDialog(true)} className="cursor-pointer">
            Cập nhật
          </Button>
          <Button variant="outline" onClick={() => router.back()} className="cursor-pointer">
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
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="cursor-pointer">
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={openUpdateDialog} onOpenChange={setOpenUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận cập nhật</DialogTitle>
            <DialogDescription> Bạn có chắc muốn cập nhật thông tin này?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenUpdateDialog(false)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                setOpenUpdateDialog(false);
                handleUpdate();
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
