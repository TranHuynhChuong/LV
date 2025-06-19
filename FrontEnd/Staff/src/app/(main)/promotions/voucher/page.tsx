'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import api from '@/lib/axiosClient';
import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import VoucherPromotionsTable from './components/VoucherPromotionTable';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { VoucherPromotionSearchBar } from './components/VoucherPromotionSearchBar';

export type ApiVoucherPromotionSimple = {
  MG_id: number;
  MG_ten: string;
  MG_batDau: Date;
  MG_ketThuc: Date;
  MG_theoTyLe: boolean;
  MG_giaTri: number;
  MG_loai: number;
  MG_toiThieu: number;
  MG_toiDa?: number;
};

export type VoucherPromotionSimple = {
  id: number;
  name: string;
  startAt: Date;
  endAt: Date;
  type: string;
};

const filterMap: Record<string, number> = {
  ended: 0,
  open: 1,
  active: 2,
};

const typeMap: Record<number, string> = {
  1: 'Hóa đơn',
  2: 'Vận chuyển',
};

const typeMapCode: Record<string, number> = {
  all: 0,
  order: 1,
  shipping: 2,
};

export default function VoucherPromotion() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Mã giảm giá' }]);
  }, [setBreadcrumbs]);

  const [data, setData] = useState<VoucherPromotionSimple[]>([]);
  const [pagination, setPagination] = useState<number[]>([1]);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();

  const router = useRouter();
  const status = searchParams.get('status') ?? 'open';
  const type = typeMapCode[searchParams.get('type') ?? 'all'];
  const page = parseInt(searchParams.get('page') ?? '1');

  const promotionId = searchParams.get('id') ?? undefined;

  const filterType = filterMap[status];
  const limit = 24;

  const mapVouchers = (data: ApiVoucherPromotionSimple[]): VoucherPromotionSimple[] =>
    data.map((item) => ({
      id: item.MG_id,
      name: item.MG_ten,
      startAt: item.MG_batDau,
      endAt: item.MG_ketThuc,
      type: typeMap[item.MG_loai],
    }));

  const fetchData = useCallback(
    (page: number, filterType: number, type: number, promotionId?: string) => {
      setIsLoading(true);

      if (promotionId) {
        api
          .get(`vouchers/${promotionId}?filterType=${filterType}&type=${type}`)
          .then((res) => {
            const item = res.data;
            const mapped: VoucherPromotionSimple = {
              id: item.MG_id,
              name: item.MG_ten,
              startAt: item.MG_batDau,
              endAt: item.MG_ketThuc,
              type: typeMap[item.MG_loai],
            };
            setData([mapped]);
            setPagination([]);
            setTotalPage(1);
            setTotalItems(1);
          })
          .catch(() => {
            setData([]);
            setPagination([1]);
            setTotalPage(1);
            setTotalItems(0);
          })
          .finally(() => setIsLoading(false));

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
          const { data, metadata } = res.data;

          setData(mapVouchers(data));
          setPagination(metadata.pagination);
          setTotalPage(metadata.totalPage);
          setTotalItems(metadata.totalItems);
        })
        .catch(() => {
          setData([]);
          setPagination([1]);
          setTotalPage(1);
          setTotalItems(0);
        })
        .finally(() => setIsLoading(false));
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
          {['ended', 'open', 'active'].map((tab) => (
            <Link
              key={tab}
              href={{ pathname: `/promotions/voucher`, query: { status: tab, page: 1 } }}
            >
              <Button variant={status === tab ? 'default' : 'outline'} className="cursor-pointer">
                {tab === 'ended' && `Đã kết thúc`}
                {tab === 'open' && `Chưa kết thúc`}
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
        <VoucherPromotionSearchBar onApply={handleSearch} onReset={handleClearSearch} />
        <VoucherPromotionsTable
          data={data}
          loading={isLoading}
          pagination={pagination}
          totalPage={totalPage}
          page={page}
          onPageChange={handlePageChange}
          total={0}
        />
      </div>
    </div>
  );
}
