'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Props = {
  open: boolean;
  clearOrder: () => void;
};

export default function OrderSuccessDialog({ open, clearOrder }: Readonly<Props>) {
  const router = useRouter();

  const handleClose = (open: boolean) => {
    if (!open) {
      clearOrder();
      router.replace('/cart');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader className="flex flex-col items-center">
          <DialogTitle>Đơn hàng được tạo thành công</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="flex flex-col items-center w-full">
          <CheckCheck size={48} color="green" />
          <p className="mt-2 text-xs text-center">
            Đơn hàng đã được tạo thành công, vui lòng kiểm tra email.
          </p>
        </div>
        <DialogFooter>
          <div className="flex flex-col items-center w-full">
            <p className="text-xs text-muted-foreground">
              Bạn sẽ được chuyển về giỏ hàng trong giây lát...
            </p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
