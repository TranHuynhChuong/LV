import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  submitting?: boolean;
  isHidden: boolean;
};

export default function ConfirmToggleReviewDialog({
  open,
  onOpenChange,
  onConfirm,
  submitting,
  isHidden,
}: Readonly<Props>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận {isHidden ? 'hiện' : 'ẩn'} đánh giá</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn {isHidden ? 'hiển thị' : 'ẩn'} đánh giá này không?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="cursor-pointer"
          >
            Hủy
          </Button>
          <Button onClick={onConfirm} disabled={submitting} className="cursor-pointer">
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
