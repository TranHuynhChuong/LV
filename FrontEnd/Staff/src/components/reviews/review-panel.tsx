'use client';

import ReviewList from '@/components/reviews/review-list';
import { ReviewSearchBar } from '@/components/reviews/review-searchbar';
import { Button } from '@/components/ui/button';
import PaginationControls from '@/components/utils/pagination-controls';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import eventBus from '@/lib/event-bus';
import { Review, mappedReviewFromDto } from '@/models/reviews';
import { startOfDay } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function ReviewPanel() {
  const { setBreadcrumbs } = useBreadcrumb();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Đánh giá' }]);
  }, [setBreadcrumbs]);

  const [data, setData] = useState<Review[]>([]);
  const [pageNumbers, setPageNumbers] = useState<number[]>([1]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const type = (searchParams.get('type') ?? 'visible') as 'all' | 'visible' | 'hidden';
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = 20;
  const rating = searchParams.get('rating') ?? '';
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';

  const getData = useCallback(
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
        setData(mapped);
        setPageNumbers(paginationInfo.pageNumbers);
        setTotalPages(paginationInfo.totalPage);
        setTotalItems(paginationInfo.totalItems);
      } catch {
        setData([]);
        setPageNumbers([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    },
    [type, rating, from, to]
  );

  useEffect(() => {
    getData(page);
    const handler = () => getData(page);
    eventBus.on('review:refetch', handler);
    return () => {
      eventBus.off('review:refetch', handler);
    };
  }, [page, getData]);

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
    router.replace(`/reviews?${search.toString()}`);
  };

  const handleClearSearch = () => {
    const search = new URLSearchParams();
    search.set('type', type);
    search.set('page', '1');
    router.replace(`/reviews?${search.toString()}`);
  };

  const handlePageChange = (targetPage: number) => {
    const search = new URLSearchParams(searchParams.toString());
    search.set('page', targetPage.toString());
    router.push(`/reviews?${search.toString()}`);
  };

  const handleTabChange = (tab: string) => {
    const search = new URLSearchParams(searchParams.toString());
    search.set('type', tab);
    router.replace(`/reviews?${search.toString()}`);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="p-4 space-y-6 bg-white border rounded-md">
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'visible', 'hidden'].map((tab) => (
            <Button
              key={tab}
              variant={type === tab ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleTabChange(tab)}
            >
              {tab === 'all' && `Tất cả `}
              {tab === 'visible' && `Hiển thị `}
              {tab === 'hidden' && `Đã ẩn `}
            </Button>
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
        <ReviewList data={data} />
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
