'use client';

import { VoucherPromotionSearchBar } from '@/components/promotions/voucher/voucher-promotion-searchbar';
import VoucherPromotionsTable from '@/components/promotions/voucher/voucher-promotion-table';
import { Button } from '@/components/ui/button';
import PaginationControls from '@/components/utils/pagination-controls';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import { Voucher } from '@/models/voucher';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

enum VoucherFilterType {
  Expired = 'expired',
  NotEnded = 'notEnded',
  Active = 'active',
}

enum VoucherType {
  Shipping = 'vc',
  Order = 'hd',
  All = 'all',
}

export default function Page() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Mã giảm giá' }]);
  }, [setBreadcrumbs]);

  const [data, setData] = useState<Voucher[]>([]);
  const [pageNumbers, setPageNumbers] = useState<number[]>([1]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const searchParams = useSearchParams();

  const router = useRouter();
  const status = searchParams.get('status') ?? 'notEnded';
  const type = (searchParams.get('type') ?? 'all') as VoucherType;
  const page = parseInt(searchParams.get('page') ?? '1');
  const promotionId = searchParams.get('id') ?? undefined;
  const filterType = status as VoucherFilterType;
  const limit = 12;

  const getData = useCallback(async function getData(
    page: number,
    filterType: string,
    type: string,
    promotionId?: string
  ): Promise<void> {
    try {
      if (promotionId) {
        const res = await api.get(`/vouchers/${promotionId}?filterType=${filterType}&type=${type}`);

        const item = res.data;
        setData([item]);
        setPageNumbers([]);
        setTotalPages(1);
        setTotalItems(1);
        return;
      }

      const params = {
        page,
        limit,
        filterType,
        type,
      };

      const res = await api.get('/vouchers', { params });
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
  []);

  useEffect(() => {
    getData(page, filterType, type, promotionId);
  }, [status, page, filterType, type, promotionId, getData]);

  const handlePageChange = (targetPage: number) => {
    if (targetPage !== page) {
      if (targetPage !== page) {
        const search = new URLSearchParams(searchParams);
        search.set('page', targetPage.toString());
        router.push(`/promotions/vouchers?${search.toString()}`);
      }
    }
  };

  const handleSearch = (type: string, code?: string) => {
    const search = new URLSearchParams();
    search.set('status', status);
    search.set('type', type);
    if (code) {
      search.set('id', code);
    }
    router.replace(`/promotions/vouchers?${search.toString()}`);
  };

  const handleClearSearch = () => {
    const search = new URLSearchParams();
    search.set('status', status);
    router.replace(`/promotions/vouchers?${search.toString()}`);
  };

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('status', tab);
    params.set('page', '1');
    router.replace(`/promotions/vouchers?${params.toString()}`);
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

          <Link href="/promotions/vouchers/new">
            <Button className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" /> Thêm mới
            </Button>
          </Link>
        </div>
        <VoucherPromotionSearchBar
          initalcode={promotionId ?? ''}
          onApply={handleSearch}
          onReset={handleClearSearch}
        />
        <VoucherPromotionsTable data={data} />

        <div className="my-4">
          <PaginationControls
            pageNumbers={pageNumbers}
            totalPages={totalPages}
            currentPage={page}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
