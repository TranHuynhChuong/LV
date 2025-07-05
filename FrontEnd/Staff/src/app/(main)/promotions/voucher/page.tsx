'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import api from '@/lib/axios';
import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import VoucherPromotionsTable from '@/components/promotions/voucher/VoucherPromotionTable';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { VoucherPromotionSearchBar } from '@/components/promotions/voucher/VoucherPromotionSearchBar';
import PaginationControls from '@/components/utils/PaginationControls';
import {
  mapVoucherPromotionOverviewFromDto,
  VoucherPromotionOverview,
  VoucherPromotionOverviewDto,
} from '@/models/promotionVoucher';

export enum VoucherFilterType {
  Expired = 'expired',
  NotEnded = 'notEnded',
  Active = 'active',
}

export enum VoucherType {
  Shipping = 'vc',
  Order = 'hd',
  All = 'all',
}

const mapVouchers = (data: VoucherPromotionOverviewDto[]): VoucherPromotionOverview[] =>
  data.map((item) => ({
    id: item.MG_id,
    startAt: item.MG_batDau,
    endAt: item.MG_ketThuc,
    type: item.MG_loai,
  }));

export default function VoucherPromotion() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Mã giảm giá' }]);
  }, [setBreadcrumbs]);

  const [data, setData] = useState<VoucherPromotionOverview[]>([]);
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
  const limit = 24;

  const fetchData = useCallback(
    (page: number, filterType: string, type: string, promotionId?: string) => {
      if (promotionId) {
        api
          .get(`vouchers/${promotionId}?filterType=${filterType}&type=${type}`)
          .then((res) => {
            const item = res.data;
            setData(mapVoucherPromotionOverviewFromDto([item]));
            setPageNumbers([]);
            setTotalPages(1);
            setTotalItems(1);
          })
          .catch(() => {
            setData([]);
            setPageNumbers([1]);
            setTotalPages(1);
            setTotalItems(0);
          });

        return;
      }

      const params = {
        page,
        limit,
        filterType,
        type,
      };

      api
        .get('/vouchers', { params })
        .then((res) => {
          const { data, paginationInfo } = res.data;

          setData(mapVouchers(data));
          setPageNumbers(paginationInfo.pageNumbers);
          setTotalPages(paginationInfo.totalPages);
          setTotalItems(paginationInfo.totalItems);
        })
        .catch(() => {
          setData([]);
          setPageNumbers([1]);
          setTotalPages(1);
          setTotalItems(0);
        });
    },
    []
  );

  useEffect(() => {
    fetchData(page, filterType, type, promotionId);
  }, [status, page, filterType, type, promotionId, fetchData]);

  const handlePageChange = (targetPage: number) => {
    if (targetPage !== page) {
      fetchData(targetPage, filterType, type, promotionId);
    }
  };

  const handleSearch = (type: string, code?: string) => {
    const search = new URLSearchParams();
    search.set('status', status);
    search.set('type', type);
    if (code) {
      search.set('id', code);
    }
    router.push(`/promotions/voucher?${search.toString()}`);
  };

  const handleClearSearch = () => {
    const search = new URLSearchParams();
    search.set('status', status);
    router.push(`/promotions/voucher?${search.toString()}`);
  };

  return (
    <div className="min-w-fit p-4">
      <div className="space-y-4 bg-white min-w-fit rounded-sm shadow p-4">
        <div className="flex gap-2">
          {['expired', 'notEnded', 'active'].map((tab) => (
            <Link
              key={tab}
              href={{ pathname: `/promotions/voucher`, query: { status: tab, page: 1 } }}
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

          <Link href="/promotions/voucher/new">
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
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
