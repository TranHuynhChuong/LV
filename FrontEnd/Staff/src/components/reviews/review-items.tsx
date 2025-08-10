'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/axios-client';
import eventBus from '@/lib/event-bus';
import { Review } from '@/models/reviews';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { Eye, EyeOff, MessageCircleMore } from 'lucide-react';
import Image from 'next/image';
import { FC, useState } from 'react';
import { toast } from 'sonner';
import Loader from '@/components/utils/loader';
import dynamic from 'next/dynamic';
import { ActionHistorySheet } from '../utils/activitylog-sheet-dynamic-import';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';

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
        <h2 className="pb-2  text-sm "> {review.bookName}</h2>
        <div className="flex space-x-2">
          <div className="relative w-20 h-20 shrink-0">
            <Image
              src={review.bookImage}
              alt={review.bookName}
              sizes="80px"
              fill
              className="object-cover rounded-sm border"
            />
          </div>
          <div className="flex-1 space-y-1">
            <div className="text-sm flex space-x-2">
              <p>Điểm: {review.rating}/5 </p>
              {review.comment && (
                <HoverCard>
                  <HoverCardTrigger>
                    <span className="text-xs cursor-pointer">
                      <MessageCircleMore size={18} />
                    </span>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80" side="top">
                    <p className="text-xs">{review.comment}</p>
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>
            <div className="text-xs text-muted-foreground">Mã đơn hàng: {review.orderId}</div>
            <div className="text-xs text-muted-foreground">Người đánh giá: {review.name}</div>
            <div className="text-xs text-muted-foreground">
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
