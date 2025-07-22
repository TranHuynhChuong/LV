'use client';

import { useCallback, useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PaginationControls from '@/components/utils/PaginationControls';

import { Review, mappedReviewFromDto } from '@/models/reviews';
import { ReviewSearchBar } from '@/components/reviews/reviewSearchBar'; // dùng đúng cái bạn tạo
import ReviewList from '@/components/reviews/reviewList';
import eventBus from '@/lib/eventBus';
import { startOfDay } from 'date-fns';

export default function ReviewsPage() {
  const { setBreadcrumbs } = useBreadcrumb();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Đánh giá' }]);
  }, [setBreadcrumbs]);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [pageNumbers, setPageNumbers] = useState<number[]>([1]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const type = (searchParams.get('type') ?? 'visible') as 'all' | 'visible' | 'hidden';
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = 20;
  const rating = searchParams.get('rating') ?? '';
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';

  const fetchData = useCallback(
    async (page: number) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params: any = {
          page,
          status: type,
          limit,
        };

        if (rating) params.rating = rating;
        if (from) params.from = from;
        if (to) params.to = to;

        const res = await api.get('/reviews/all', { params });
        const { data, paginationInfo } = res.data;

        const mapped = mappedReviewFromDto(data);
        setReviews(mapped);
        setPageNumbers(paginationInfo.pageNumbers);
        setTotalPages(paginationInfo.totalPage);
        setTotalItems(paginationInfo.totalItems);
      } catch (err) {
        console.error(err);
        setReviews([]);
        setPageNumbers([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    },
    [type, rating, from, to]
  );

  useEffect(() => {
    fetchData(page);

    const handler = () => fetchData(page);
    eventBus.on('review:refetch', handler);

    return () => {
      eventBus.off('review:refetch', handler);
    };
  }, [page, fetchData]);

  const handleSearch = (filters: { rating?: number; daterange?: { from?: Date; to?: Date } }) => {
    const search = new URLSearchParams(searchParams.toString());
    search.set('page', '1');
    search.set('type', type);

    if (filters.rating) search.set('rating', filters.rating.toString());
    else search.delete('rating');

    if (filters.daterange?.from) {
      search.set('from', startOfDay(filters.daterange.from).toDateString());
    } else {
      search.delete('from');
    }

    if (filters.daterange?.to) {
      search.set('to', startOfDay(filters.daterange.to).toDateString());
    } else {
      search.delete('to');
    }

    router.push(`/reviews?${search.toString()}`);
  };

  const handleClearSearch = () => {
    const search = new URLSearchParams();
    search.set('type', type);
    search.set('page', '1');
    router.push(`/reviews?${search.toString()}`);
  };

  const handlePageChange = (targetPage: number) => {
    const search = new URLSearchParams(searchParams.toString());
    search.set('page', targetPage.toString());
    router.push(`/reviews?${search.toString()}`);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="p-4 bg-white border rounded-md space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'visible', 'hidden'].map((tab) => (
            <Link key={tab} href={`/reviews?type=${tab}`}>
              <Button variant={type === tab ? 'default' : 'outline'} className="cursor-pointer">
                {tab === 'all' && `Tất cả `}
                {tab === 'visible' && `Hiển thị `}
                {tab === 'hidden' && `Đã ẩn `}
              </Button>
            </Link>
          ))}
        </div>

        <ReviewSearchBar
          initialRating={rating ? parseInt(rating) : undefined}
          initialDateRange={{
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
          }}
          onApply={handleSearch}
          onReset={handleClearSearch}
        />

        <div className="font-medium">{totalItems} Đánh giá</div>
      </div>

      <div className="space-y-4">
        <ReviewList reviews={reviews} />
        <PaginationControls
          pageNumbers={pageNumbers}
          totalPages={totalPages}
          currentPage={page}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
