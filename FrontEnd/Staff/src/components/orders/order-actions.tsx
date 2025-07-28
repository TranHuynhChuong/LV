'use client';

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
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import Loader from '../utils/loader';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  loading = false,
}: Readonly<Props>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="cursor-pointer"
          >
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} disabled={loading} className="cursor-pointer">
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ActionStatus = 'XacNhan' | 'VanChuyen' | 'GiaoThanhCong' | 'GiaoThatBai' | 'Huy';

const actionMap: Record<
  ActionStatus,
  {
    endpoint: (orderId: string) => string;
    successMsg: string;
    errorMsg: string;
    confirmTitle: string;
    confirmDescription: string;
  }
> = {
  XacNhan: {
    endpoint: (id) => `/orders/toShip/${id}`,
    successMsg: 'Đã xác nhận đơn hàng.',
    errorMsg: 'Xác nhận đơn hàng thất bại.',
    confirmTitle: 'Bạn có chắc muốn xác nhận đơn hàng này?',
    confirmDescription:
      'Sau khi xác nhận, đơn hàng sẽ được chuyển sang trạng thái "Chờ vận chuyển". Vui lòng chuẩn bị hàng.',
  },
  VanChuyen: {
    endpoint: (id) => `/orders/shipping/${id}`,
    successMsg: 'Đã xác nhận vận chuyển.',
    errorMsg: 'Xác nhận vận chuyển thất bại.',
    confirmTitle: 'Bạn có chắc muốn xác nhận vận chuyển đơn hàng này?',
    confirmDescription:
      'Đơn hàng sẽ được cập nhật là "Đang vận chuyển". Vui lòng đảm bảo hàng đã được chuẩn bị để gửi đi.',
  },
  GiaoThanhCong: {
    endpoint: (id) => `/orders/complete/${id}`,
    successMsg: 'Xác nhận giao hàng thành công.',
    errorMsg: 'Xác nhận giao thành công thất bại.',
    confirmTitle: 'Giao hàng thành công?',
    confirmDescription:
      'Đơn hàng sẽ được chuyển sang trạng thái "Hoàn thành". Thao tác này không thể hoàn tác.',
  },
  GiaoThatBai: {
    endpoint: (id) => `/orders/inComplete/${id}`,
    successMsg: 'Xác nhận giao hàng không thành công.',
    errorMsg: 'Xác nhận giao không thành công thất bại.',
    confirmTitle: 'Giao hàng thất bại?',
    confirmDescription:
      'Đơn hàng sẽ bị đánh dấu là giao hàng thất bại. Bạn có chắc chắn muốn thực hiện?',
  },
  Huy: {
    endpoint: (id) => `/orders/canceled/${id}`,
    successMsg: 'Xác nhận hủy đơn hàng thành công.',
    errorMsg: 'Xác nhận hủy đơn hàng thất bại.',
    confirmTitle: 'Bạn có chắc muốn hủy đơn hàng này?',
    confirmDescription:
      'Hủy đơn hàng là hành động không thể hoàn tác. Vui lòng xác nhận kỹ trước khi tiếp tục.',
  },
};

export default function OrderActions({
  id,
  status,
  onSuccess,
  showView = true,
}: Readonly<{ id: string; status: string; onSuccess?: () => void; showView?: boolean }>) {
  const { authData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialog, setDialog] = useState<ActionStatus | null>(null);
  const canCancel = status === 'ChoXacNhan' || status === 'ChoVanChuyen' || status === 'YeuCauHuy';

  const handleSubmit = async () => {
    if (!dialog || !authData.userId) return;
    setIsSubmitting(true);
    setDialog(null);
    try {
      const action = actionMap[dialog];
      await api.patch(action.endpoint(id), { staffId: authData.userId });
      toast.success(action.successMsg);
      onSuccess?.();
    } catch {
      toast.error(actionMap[dialog].errorMsg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-wrap justify-end w-full gap-2">
      {isSubmitting && <Loader />}
      {canCancel && (
        <Button
          variant="destructive"
          onClick={() => setDialog('Huy')}
          className="text-sm font-normal cursor-pointer"
        >
          Hủy đơn
        </Button>
      )}
      {status === 'ChoXacNhan' && (
        <Button onClick={() => setDialog('XacNhan')} className="text-sm font-normal cursor-pointer">
          Xác nhận
        </Button>
      )}
      {status === 'ChoVanChuyen' && (
        <Button
          onClick={() => setDialog('VanChuyen')}
          className="text-sm font-normal cursor-pointer"
        >
          Vận chuyển
        </Button>
      )}
      {status === 'DangVanChuyen' && (
        <>
          <Button
            variant="destructive"
            onClick={() => setDialog('GiaoThatBai')}
            className="text-sm font-normal cursor-pointer"
          >
            Giao thất bại
          </Button>
          <Button
            onClick={() => setDialog('GiaoThanhCong')}
            className="text-sm font-normal cursor-pointer"
          >
            Giao thành công
          </Button>
        </>
      )}
      {showView && (
        <Link href={`/orders/${id}`}>
          <Button variant="outline" className="text-sm font-normal cursor-pointer">
            Xem chi tiết
          </Button>
        </Link>
      )}
      <ConfirmDialog
        open={!!dialog}
        onOpenChange={(open) => !open && setDialog(null)}
        onConfirm={handleSubmit}
        loading={isSubmitting}
        title={dialog ? actionMap[dialog].confirmTitle : ''}
        description={dialog ? actionMap[dialog].confirmDescription : ''}
      />
    </div>
  );
}
