'use client';

import { FC, useState } from 'react';
import Image from 'next/image';
import { Review } from '@/models/reviews';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

import { format } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { ActionHistorySheet } from '../utils/ActivityLogSheet';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import eventBus from '@/lib/eventBus';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Loader from '../utils/Loader';

type ConfirmToggleReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  submitting?: boolean;
  isHidden: boolean;
};

export function ConfirmToggleReviewDialog({
  open,
  onOpenChange,
  onConfirm,
  submitting,
  isHidden,
}: Readonly<ConfirmToggleReviewDialogProps>) {
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={onConfirm} disabled={submitting}>
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type Props = {
  review: Review;
};

const ReviewItem: FC<Props> = ({ review }) => {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { authData } = useAuth();
  const handleToggleVisibility = () => {
    if (!authData?.userId) return;
    setIsSubmitting(true);
    setOpenConfirm(false);
    const endpoint = review.isHidden ? '/reviews/show' : '/reviews/hide';

    const body = {
      DG_id: review.orderId,
      SP_id: review.productId,
      KH_id: review.customerId,
      NV_id: authData.userId,
    };

    api
      .patch(endpoint, body)
      .then(() => {
        toast.success(review.isHidden ? 'Hiện đánh giá thành công' : 'Đã ẩn đánh giá');
        eventBus.emit('review:refetch');
      })
      .catch((err) => {
        console.error(err);
        toast.error('Thao tác thất bại');
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="p-4 border rounded-md bg-white flex flex-col md:flex-row gap-4">
      {isSubmitting && <Loader />}
      <div className="flex-col flex-1">
        <h2 className="pl-4 pb-4 text-sm font-semibold">Mã đơn hàng: {review.orderId}</h2>
        <div className="flex">
          <div className="w-24 h-24 relative shrink-0">
            <Image
              src={review.productImage}
              alt={review.productName}
              fill
              className="rounded-md object-cover"
            />
          </div>

          {/* Nội dung */}
          <div className="flex-1 space-y-1">
            <div className="text-sm text-muted-foreground">{review.productName}</div>
            <div className="text-sm">
              Người đánh giá: <strong>{review.name}</strong>
            </div>
            <div className="text-sm">
              Điểm: <strong>{review.rating}⭐</strong>
            </div>

            <div className="text-sm text-muted-foreground">
              Ngày: {format(new Date(review.createdAt), 'dd/MM/yyyy', { locale: vi })}
            </div>
          </div>
        </div>
      </div>
      {/* Ảnh sản phẩm */}

      {/* Hành động */}
      <div className="flex justify-end">
        <div className="mr-12">
          <Button
            variant={review.isHidden ? 'default' : 'outline'}
            onClick={() => setOpenConfirm(true)}
            className="cursor-pointer"
          >
            {review.isHidden ? (
              <>
                <Eye className="w-4 h-4 mr-1" /> Hiện
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 mr-1" /> Ẩn
              </>
            )}
          </Button>
          <ConfirmToggleReviewDialog
            open={openConfirm}
            onOpenChange={setOpenConfirm}
            onConfirm={handleToggleVisibility}
            submitting={isSubmitting}
            isHidden={review.isHidden}
          />
        </div>
        <div className="relative">
          {/* Lịch sử */}
          <ActionHistorySheet activityLogs={review.activityLogs} />
        </div>
      </div>
    </div>
  );
};

export default ReviewItem;
