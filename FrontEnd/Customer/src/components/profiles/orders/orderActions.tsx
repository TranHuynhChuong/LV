'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import Loader from '@/components/utils/Loader';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

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
        <Link href={`/profile/orders/${id}`}>
          <Button variant="outline" className="text-sm font-normal cursor-pointer">
            Xem chi tiết
          </Button>
        </Link>
      )}

      {canReview && (
        <Link href={`/profile/orders/${id}/review`}>
          <Button variant="outline" className="text-sm font-normal border-zinc-500 cursor-pointer ">
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
