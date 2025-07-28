'use client';

import { FC } from 'react';
import { Review } from '@/models/reviews';
import ReviewItem from './review-items';

type Props = {
  data: Review[];
};

const ReviewList: FC<Props> = ({ data }) => {
  return (
    <div className="space-y-2">
      {data.map((review, index) => (
        <ReviewItem key={`${review.orderId}-${review.bookId}-${index}`} review={review} />
      ))}
    </div>
  );
};

export default ReviewList;
