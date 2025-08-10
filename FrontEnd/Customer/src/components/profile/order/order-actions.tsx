'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/axios-client';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Loader from '@/components/utils/loader';

type ConfirmDialogProps = {
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
}: Readonly<ConfirmDialogProps>) {
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

type ActionStatus = 'Huy';

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
  Huy: {
    endpoint: (id) => `/orders/cancelRequest/${id}`,
    successMsg: 'Yêu cầu hủy đơn hàng đã được gửi.',
    errorMsg: 'Đã xảy ra lỗi, vui lòng thử lại.',
    confirmTitle: 'Bạn có chắc muốn gửi yêu cầu hủy đơn hàng này?',
    confirmDescription:
      'Yêu cầu hủy đơn hàng là hành động không thể hoàn tác. Vui lòng xác nhận kỹ trước khi tiếp tục.',
  },
};

export default function OrderActions({
  id,
  status,
  reviewed = false,
  onSuccess,
  showView = true,
}: Readonly<{
  id: string;
  reviewed?: boolean;
  status: string;
  onSuccess?: () => void;
  showView?: boolean;
}>) {
  const { authData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialog, setDialog] = useState<ActionStatus | null>(null);

  const canCancel = status === 'ChoXacNhan' || status === 'ChoVanChuyen';
  const canReview = status === 'GiaoThanhCong' && !reviewed;
  const handleSubmit = async () => {
    if (!dialog || !authData.userId) return;

    setIsSubmitting(true);
    setDialog(null);
    try {
      const action = actionMap[dialog];
      await api.patch(action.endpoint(id), { staffId: authData.userId });
      toast.success(action.successMsg);
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(actionMap[dialog].errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-wrap justify-end w-full gap-2">
      {isSubmitting && <Loader />}

      {canCancel && (
        <Button
          variant="outline"
          onClick={() => setDialog('Huy')}
          className="text-sm font-normal cursor-pointer border-red-600/30 text-red-600/80 hover:text-red-600/90"
        >
          Hủy đơn
        </Button>
      )}

      {showView && (
        <Link href={`/profile/order/${id}`}>
          <Button variant="outline" className="text-sm font-normal cursor-pointer">
            Xem chi tiết
          </Button>
        </Link>
      )}

      {canReview && (
        <Link href={`/profile/order/${id}/review`}>
          <Button variant="outline" className="text-sm font-normal cursor-pointer border-zinc-500 ">
            Đánh giá
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
