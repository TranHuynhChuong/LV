'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import api from '@/lib/axios';
import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BookPromotionsTable from '@/components/promotions/book/book-promotions-table';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { BookPromotionSearchBar } from '@/components/promotions/book/book-promotion-searchbar';
import PaginationControls from '@/components/utils/pagination-controls';
import { mapBookPromotionsFromDto, BookPromotionOverview } from '@/models/promotionBook';

export enum PromotionFilterType {
  Expired = 'expired',
  NotEnded = 'notEnded',
  Active = 'active',
}

export default function Page() {
  const { setBreadcrumbs } = useBreadcrumb();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Giảm giá sách' }]);
  }, [setBreadcrumbs]);

  const [data, setData] = useState<BookPromotionOverview[]>([]);
  const [pageNumbers, setPageNumbers] = useState<number[]>([1]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const status = searchParams.get('status') ?? 'notEnded';

  const currentPage = parseInt(searchParams.get('page') ?? '1');
  const promotionId = searchParams.get('id') ?? undefined;

  const filterType = status as PromotionFilterType;
  const itemPerPage = 24;

  const fetchData = useCallback(
    async (page: number, filterType: PromotionFilterType, promotionId?: string) => {
      try {
        if (promotionId) {
          const res = await api.get(`promotions/${promotionId}?filterType=${filterType}`);
          const item = res.data;
          setData(mapBookPromotionsFromDto([item]));
          setPageNumbers([]);
          setTotalPages(1);
          setTotalItems(1);
          return;
        }

        const params = {
          page,
          limit: itemPerPage,
          filterType,
        };

        const res = await api.get('/promotions', { params });
        const { data, paginationInfo } = res.data;
        setData(mapBookPromotionsFromDto(data));
        setPageNumbers(paginationInfo.pageNumbers);
        setTotalPages(paginationInfo.totalPages);
        setTotalItems(paginationInfo.totalItems);
      } catch (error) {
        console.error(error);
        setData([]);
        setPageNumbers([1]);
        setTotalPages(1);
        setTotalItems(0);
      }
    },
    []
  );

  useEffect(() => {
    fetchData(currentPage, filterType, promotionId);
  }, [status, currentPage, filterType, promotionId, fetchData]);

  const handlePageChange = (targetPage: number) => {
    if (targetPage !== currentPage) {
      fetchData(targetPage, filterType, promotionId);
    }
  };

  const handleSearch = (code: string) => {
    const search = new URLSearchParams();
    search.set('status', status);
    search.set('id', code);
    router.push(`/promotions/books?${search.toString()}`);
  };

  const handleClearSearch = () => {
    const search = new URLSearchParams();
    search.set('status', status);
    router.push(`/promotions/books?${search.toString()}`);
  };

  return (
    <div className="min-w-fit p-4">
      <div className="space-y-4 bg-white min-w-fit rounded-sm shadow p-4">
        <div className="flex gap-2">
          {['expired', 'notEnded', 'active'].map((tab) => (
            <Link
              key={tab}
              href={{ pathname: `/promotions/books`, query: { status: tab, page: 1 } }}
            >
              <Button variant={status === tab ? 'default' : 'outline'} className="cursor-pointer">
                {tab === 'expired' && `Đã kết thúc`}
                {tab === 'notEnded' && `Chưa kết thúc`}
                {tab === 'active' && `Đang diễn ra`}
              </Button>
            </Link>
          ))}
        </div>
        <div className="flex items-center justify-between my-4">
          <h1 className="text-lg  pl-4">
            <strong>{totalItems}</strong> Khuyến mãi
          </h1>

          <Link href="/promotions/books/new">
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Button>
          </Link>
        </div>
        <BookPromotionSearchBar
          initalcode={promotionId ?? ''}
          onApply={handleSearch}
          onReset={handleClearSearch}
        />
        <BookPromotionsTable data={data} />
        <div className="my-4">
          <PaginationControls
            pageNumbers={pageNumbers}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
