'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Mode = 'delete' | 'submit';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  mode?: Mode;
  isEdit?: boolean;
};

const defaultConfig = {
  delete: {
    title: 'Xác nhận xóa?',
    description: 'Bạn có chắc chắn muốn xóa dữ liệu này không? Hành động này không thể hoàn tác.',
    confirmText: 'Xóa',
    variant: 'destructive' as const,
  },
  submit: {
    title: (isEdit: boolean) => (isEdit ? 'Xác nhận cập nhật?' : 'Xác nhận thêm?'),
    description: (isEdit: boolean) =>
      isEdit
        ? 'Bạn có chắc chắn muốn cập nhật thông tin này không? Dữ liệu cũ sẽ bị thay thế.'
        : 'Bạn có chắc chắn muốn thêm mới dữ liệu này không? Hành động này sẽ ghi nhận dữ liệu mới vào hệ thống.',
    confirmText: (isEdit: boolean) => (isEdit ? 'Cập nhật' : 'Thêm'),
    variant: 'default' as const,
  },
};

export default function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  mode = 'submit',
  isEdit = false,
}: Props) {
  const config = defaultConfig[mode];
  const title = typeof config.title === 'function' ? config.title(isEdit) : config.title;
  const description =
    typeof config.description === 'function' ? config.description(isEdit) : config.description;
  const confirmText =
    typeof config.confirmText === 'function' ? config.confirmText(isEdit) : config.confirmText;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
            Hủy
          </Button>
          <Button
            variant={config.variant}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="cursor-pointer"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
