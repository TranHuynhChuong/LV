'use client';

import { BookPromotionSearchBar } from '@/components/promotions/book/book-promotion-searchbar';
import BookPromotionsTable from '@/components/promotions/book/book-promotions-table';
import { Button } from '@/components/ui/button';
import PaginationControls from '@/components/utils/pagination-controls';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import { Promotion } from '@/models/promotion';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

enum PromotionFilterType {
  Expired = 'expired',
  NotEnded = 'notEnded',
  Active = 'active',
}

export default function BookPromotionPanel() {
  const { setBreadcrumbs } = useBreadcrumb();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Giảm giá sách' }]);
  }, [setBreadcrumbs]);

  const [data, setData] = useState<Promotion[]>([]);
  const [pageNumbers, setPageNumbers] = useState<number[]>([1]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const status = searchParams.get('status') ?? 'notEnded';
  const currentPage = parseInt(searchParams.get('page') ?? '1');
  const promotionId = searchParams.get('id') ?? undefined;
  const filterType = status as PromotionFilterType;
  const itemPerPage = 12;

  const getData = useCallback(
    async (page: number, filterType: PromotionFilterType, promotionId?: string) => {
      try {
        if (promotionId) {
          const res = await api.get(`promotions/${promotionId}?filterType=${filterType}`);
          const data = res.data;
          setData([data]);
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
        setData(data);
        setPageNumbers(paginationInfo.pageNumbers);
        setTotalPages(paginationInfo.totalPages);
        setTotalItems(paginationInfo.totalItems);
      } catch {
        setData([]);
        setPageNumbers([1]);
        setTotalPages(1);
        setTotalItems(0);
      }
    },
    []
  );

  useEffect(() => {
    getData(currentPage, filterType, promotionId);
  }, [status, currentPage, filterType, promotionId, getData]);

  const handlePageChange = (targetPage: number) => {
    if (targetPage !== currentPage) {
      const search = new URLSearchParams(searchParams);
      search.set('page', targetPage.toString());
      router.push(`/promotions/books?${search.toString()}`);
    }
  };

  const handleSearch = (code: string) => {
    const search = new URLSearchParams();
    search.set('status', status);
    search.set('id', code);
    router.replace(`/promotions/books?${search.toString()}`);
  };

  const handleClearSearch = () => {
    const search = new URLSearchParams();
    search.set('status', status);
    router.replace(`/promotions/books?${search.toString()}`);
  };

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('status', tab);
    params.set('page', '1');

    router.replace(`/promotions/books?${params.toString()}`);
  };

  return (
    <div className="p-4 min-w-fit">
      <div className="p-4 space-y-4 bg-white rounded-sm shadow min-w-fit">
        <div className="flex gap-2">
          {['expired', 'notEnded', 'active'].map((tab) => (
            <Button
              key={tab}
              variant={status === tab ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleTabChange(tab)}
            >
              {tab === 'expired' && `Đã kết thúc`}
              {tab === 'notEnded' && `Chưa kết thúc`}
              {tab === 'active' && `Đang diễn ra`}
            </Button>
          ))}
        </div>
        <div className="flex items-center justify-between my-4">
          <h1 className="pl-4 text-lg">
            <strong>{totalItems}</strong> Khuyến mãi
          </h1>

          <Link href="/promotions/books/new">
            <Button className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" /> Thêm mới
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
