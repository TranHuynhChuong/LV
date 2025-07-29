'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CircleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Props = {
  open: boolean;
  errorMessages: string[];
  clearOrder: () => void;
};

export default function OrderErrorDialog({ open, errorMessages, clearOrder }: Readonly<Props>) {
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
          <DialogTitle>Không thể tạo đơn hàng!</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="flex flex-col items-center w-full">
          <CircleAlert size={48} color="red" />
          <ul className="mt-2 space-y-1 text-xs text-center list-inside">
            {errorMessages.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <div className="flex flex-col items-center w-full">
            <p className="text-ms text-muted-foreground">Vui lòng kiểm tra và thử lại!</p>
            <p className="text-xs text-muted-foreground">
              Bạn sẽ được chuyển về giỏ hàng trong giây lát...
            </p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
