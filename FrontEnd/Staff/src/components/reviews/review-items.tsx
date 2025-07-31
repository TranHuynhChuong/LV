'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/axios-client';
import eventBus from '@/lib/event-bus';
import { Review } from '@/models/reviews';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { FC, useState } from 'react';
import { toast } from 'sonner';
import Loader from '@/components/utils/loader';
import dynamic from 'next/dynamic';
import { ActionHistorySheet } from '../utils/activitylog-sheet-dynamic-import';

const ConfirmToggleReviewDialog = dynamic(() => import('./review-confirm-dialog'), {
  ssr: false,
});

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
      DH_id: review.orderId,
      S_id: review.bookId,
      KH_id: review.customerId,
      NV_id: authData.userId,
    };

    api
      .patch(endpoint, body)
      .then(() => {
        toast.success(review.isHidden ? 'Hiện đánh giá thành công' : 'Đã ẩn đánh giá');
        eventBus.emit('review:refetch');
      })
      .catch(() => {
        toast.error('Thao tác thất bại');
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white border rounded-md md:flex-row">
      {isSubmitting && <Loader />}
      <div className="flex-col flex-1">
        <h2 className="pb-4 pl-4 text-sm font-semibold">Mã đơn hàng: {review.orderId}</h2>
        <div className="flex">
          <div className="relative w-24 h-24 shrink-0">
            <Image
              src={review.bookImage}
              alt={review.bookName}
              sizes="96px"
              fill
              className="object-cover rounded-md"
            />
          </div>
          <div className="flex-1 space-y-1">
            <div className="text-sm text-muted-foreground">{review.bookName}</div>
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
      <div className="flex justify-end">
        <div className="mr-12">
          <Button
            variant={review.isHidden ? 'outline' : 'default'}
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
          <ActionHistorySheet activityLogs={review.activityLogs} />
        </div>
      </div>
    </div>
  );
};

export default ReviewItem;
