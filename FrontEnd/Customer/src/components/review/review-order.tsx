import { Review } from '@/models/review';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

type Props = {
  reviews: Review[];
};

export default function ReviewOrderList({ reviews }: Readonly<Props>) {
  const [showAll, setShowAll] = useState(false);
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const visibleReviews = showAll ? reviews : reviews.slice(0, 1);

  const toggleExpand = (index: number) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (reviews.length === 0) {
    return <></>;
  }
  return (
    <div className="rounded-md bg-white border p-6 space-y-2">
      <h3 className="font-medium">Danh sách đánh giá</h3>
      <ul className="list-none space-y-2 divide-y divide-gray-300">
        {visibleReviews.map((review, index) => {
          const isExpanded = expanded[index] ?? false;
          return (
            <li key={index} className="py-2 space-y-1">
              <p className="text-sm">{review.title}</p>
              <div className="flex text-xs space-x-2 ">
                <p>⭐{review.rating}/5</p>
                <p>-</p>
                <p>{format(new Date(review.createAt), 'dd/MM/yyyy', { locale: vi })}</p>
              </div>
              {review.content && (
                <>
                  <p className={`text-xs text-gray-600 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                    {review.content}
                  </p>
                  {review.content.length > 100 && (
                    <button
                      onClick={() => toggleExpand(index)}
                      className="text-xs cursor-pointer hover:underline mt-0"
                    >
                      {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                    </button>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
      {reviews.length > 1 && (
        <button
          className="flex items-center justify-center w-full gap-1 text-xs cursor-pointer text-muted-foreground hover:underline"
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? 'Ẩn bớt' : `Xem thêm`}
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${showAll ? 'rotate-180' : 'rotate-0'}`}
          />
        </button>
      )}
    </div>
  );
}
