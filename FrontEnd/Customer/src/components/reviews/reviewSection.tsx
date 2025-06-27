'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';

import PaginationControls from '@/components/utils/PaginationControls';
import { ReviewOverview, ReviewOverviewDto, mappedReviewOverviewFromDto } from '@/models/reviews';
import api from '@/lib/axios';

type ReviewProps = {
  productId: number;
  rating: number;
};

export default function ReviewsSection({ productId, rating }: Readonly<ReviewProps>) {
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

      const res = await api.get(`/reviews/product/${productId}`, { params });
      const data = res.data;

      const reviewDtos: ReviewOverviewDto[] = Array.isArray(data.data) ? data.data : [data.data];
      setReviews(mappedReviewOverviewFromDto(reviewDtos));
      setPageNumbers(data.paginationInfo.pageNumbers);
      setTotalItems(data.paginationInfo.totalItems);
      setTotalPages(data.paginationInfo.totalPages);
      setStars({
        s1: data.rating.s1,
        s2: data.rating.s2,
        s3: data.rating.s3,
        s4: data.rating.s4,
        s5: data.rating.s5,
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
  }, [currentPage]);

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
      <div className="flex ">
        <div className="min-w-28 ld:min-w-32 justify-start space-y-2">
          <p className="text-sm font-medium text-zinc-700">{name}</p>
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
              {comment}
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
      <h3 className="font-medium text-lg">Đánh giá sản phẩm</h3>
      <div className=" p-4 ">
        <div className="flex items-center mb-4 gap-6">
          <div className="flex flex-col items-center gap-1">
            <span>
              <span className="text-4xl">{rating}</span>
              <span className="text-lg">/5</span>
            </span>
            <div className="flex items-center gap-0.5 text-yellow-500">
              {Array.from({ length: 5 }).map((_, i) => {
                const starFill =
                  rating >= i + 1 ? '100%' : rating > i ? `${(rating - i) * 100}%` : '0%';

                return (
                  <div key={i} className="relative w-4 h-4">
                    {/* Nền sao viền xám */}
                    <Star size={16} strokeWidth={1} className="absolute top-0 left-0" />
                    {/* Sao màu vàng đè lên */}
                    <div
                      className="absolute top-0 left-0 overflow-hidden z-0"
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
          <div className="space-y-1 w-64">
            {[5, 4, 3, 2, 1].map((star) => {
              const ratio = ((stars[`s${star}` as keyof typeof stars] || 0) / totalItems) * 100;
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
                  <div className="flex-1 bg-zinc-200 h-1 rounded overflow-hidden">
                    <div className="  h-1 bg-yellow-400" style={{ width: `${ratio}%` }}></div>
                  </div>
                  <span className="w-10 text-right text-xs">{Math.round(ratio)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Danh sách bình luận */}
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
