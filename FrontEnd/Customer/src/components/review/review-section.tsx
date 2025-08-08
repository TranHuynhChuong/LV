'use client';

import { Star } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import PaginationControls from '@/components/utils/pagination-controls';
import api from '@/lib/axios-client';
import { ReviewOverview, ReviewOverviewDto, mappedReviewOverviewFromDto } from '@/models/review';

type ReviewsSection = {
  bookId: number;
  rating: number;
};

export default function ReviewsSection({ bookId, rating }: Readonly<ReviewsSection>) {
  const [pageNumbers, setPageNumbers] = useState<number[]>([1]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [reviews, setReviews] = useState<ReviewOverview[] | []>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [stars, setStars] = useState<{
    s1: number;
    s2: number;
    s3: number;
    s4: number;
    s5: number;
  }>({
    s1: 0,
    s2: 0,
    s3: 0,
    s4: 0,
    s5: 0,
  });

  const pageSize = 6;

  const fetchData = useCallback(async () => {
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
      };
      const res = await api.get(`/reviews/book/${bookId}`, { params });
      const data = res.data;
      const reviews: ReviewOverviewDto[] = Array.isArray(data.data) ? data.data : [data.data];
      setReviews(mappedReviewOverviewFromDto(reviews));
      setPageNumbers(data.paginationInfo.pageNumbers);
      setTotalItems(data.paginationInfo.totalItems);
      setTotalPages(data.paginationInfo.totalPages);
      setStars({
        s1: data.rating.s1 ?? 0,
        s2: data.rating.s2 ?? 0,
        s3: data.rating.s3 ?? 0,
        s4: data.rating.s4 ?? 0,
        s5: data.rating.s5 ?? 0,
      });
    } catch {
      setReviews([]);
      setPageNumbers([]);
      setTotalItems(0);
      setTotalPages(0);
      setStars({
        s1: 0,
        s2: 0,
        s3: 0,
        s4: 0,
        s5: 0,
      });
    }
  }, [currentPage, bookId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (targetPage: number) => {
    setCurrentPage(targetPage);
  };

  const CommentItem = ({ comment, name, rating, createdAt }: ReviewOverview) => {
    const ref = useRef<HTMLDivElement>(null);
    const [showExpand, setShowExpand] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      requestAnimationFrame(() => {
        const clampHeight = el.offsetHeight;
        requestAnimationFrame(() => {
          const fullHeight = el.scrollHeight;
          if (fullHeight > clampHeight) {
            setShowExpand(true);
          }
        });
      });
    }, [comment]);

    return (
      <div className="flex space-x-4">
        <div className="justify-start space-y-2 w-32">
          <p className="text-sm font-medium text-zinc-700 break-words">{name}</p>
          <p className="text-xs text-zinc-500">{new Date(createdAt).toLocaleDateString('vi-VN')}</p>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-1 text-yellow-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} fill={i < rating ? 'currentColor' : 'none'} strokeWidth={1} />
            ))}
          </div>

          <div>
            <div
              ref={ref}
              className={`text-sm text-zinc-800 whitespace-pre-line transition-all duration-300 ${
                expanded ? '' : 'line-clamp-3'
              }`}
            >
              {comment?.trim()}
            </div>
            {!expanded && showExpand && (
              <button
                onClick={() => setExpanded(true)}
                className="mt-1 text-xs text-blue-600 hover:underline"
              >
                Xem thêm
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Đánh giá sách</h3>
      <div className="p-4 ">
        <div className="flex items-center gap-6 mb-4">
          <div className="flex flex-col items-center gap-1">
            <span>
              <span className="text-4xl">{rating !== 0 ? rating : '--'}</span>
              <span className="text-lg">/5</span>
            </span>
            <div className="flex items-center gap-0.5 text-yellow-500">
              {Array.from({ length: 5 }).map((_, i) => {
                const starFill =
                  rating >= i + 1 ? '100%' : rating > i ? `${(rating - i) * 100}%` : '0%';
                return (
                  <div key={i} className="relative w-4 h-4">
                    <Star size={16} strokeWidth={1} className="absolute top-0 left-0" />
                    <div
                      className="absolute top-0 left-0 z-0 overflow-hidden"
                      style={{ width: starFill }}
                    >
                      <Star
                        size={16}
                        strokeWidth={1}
                        fill="currentColor"
                        className="text-yellow-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-zinc-500">({totalItems} đánh giá)</p>
          </div>
          <div className="w-64 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const raw = stars[`s${star}` as keyof typeof stars] || 0;
              const ratio = totalItems > 0 ? (raw / totalItems) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-1 text-sm">
                  <div className="flex items-center gap-1">
                    {star}
                    <Star
                      size={12}
                      strokeWidth={1}
                      fill="currentColor"
                      className="text-yellow-500"
                    />
                  </div>
                  <div className="flex-1 h-1 overflow-hidden rounded bg-zinc-200">
                    <div className="h-1 bg-yellow-400 " style={{ width: `${ratio}%` }}></div>
                  </div>
                  <span className="w-10 text-xs text-right">{Math.round(ratio)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div key={index} className="py-4 border-t">
            <CommentItem {...review} />
          </div>
        ))}
        <PaginationControls
          pageNumbers={pageNumbers}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
