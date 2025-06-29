'use client';

import { FC } from 'react';
import Image from 'next/image';
import { Review } from '@/models/reviews';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

import { format } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { ActionHistorySheet } from '../utils/ActivityLogSheet';

type Props = {
  review: Review;
};

const ReviewItem: FC<Props> = ({ review }) => {
  const handleToggleVisibility = () => {
    // Gọi API để ẩn/hiện
    // Ví dụ: api.patch('/reviews/hide', { ...review })
    console.log('Toggle visibility');
  };

  return (
    <div className="p-4 border rounded-md bg-white flex flex-col md:flex-row gap-4">
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
            onClick={handleToggleVisibility}
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
