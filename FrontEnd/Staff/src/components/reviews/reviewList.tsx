'use client';

import { FC } from 'react';
import { Review } from '@/models/reviews';
import ReviewItem from './reviewItems';

type Props = {
  reviews: Review[];
};

const ReviewList: FC<Props> = ({ reviews }) => {
  return (
    <div className="space-y-2">
      {reviews.map((review, index) => (
        <ReviewItem key={`${review.orderId}-${review.productId}-${index}`} review={review} />
      ))}
    </div>
  );
};

export default ReviewList;
