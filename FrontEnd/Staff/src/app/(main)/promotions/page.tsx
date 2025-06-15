'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import api from '@/lib/axiosClient';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductPromotionsTable from './components/ProductPromotionsTable';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { ProductPromotionSearchBar } from './components/ProductPromotionSearchBar';

export type ApiProductPromotionSimple = {
  KM_id: number;
  KM_ten: string;
  KM_batDau: Date;
  KM_ketThuc: Date;
  KM_slsp: number;
};

export type ProductPromotionSimple = {
  id: number;
  name: string;
  startAt: Date;
  endAt: Date;
  totalProducts: number;
};

const filterMap: Record<string, number | undefined> = {
  end: 0,
  live: 1,
};

export default function ProductPromotion() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Giảm giá sản phẩm' }]);
  }, [setBreadcrumbs]);

  const [data, setData] = useState<ProductPromotionSimple[]>([]);
  const [pagination, setPagination] = useState<number[]>([1]);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();

  const router = useRouter();
  const status = searchParams.get('status') ?? 'live';
  const page = parseInt(searchParams.get('page') ?? '1');

  const promotionId = searchParams.get('id') ?? undefined;

  const filterType = filterMap[status] ?? undefined;
  const limit = 24;

  const mapProducts = (data: ApiProductPromotionSimple[]): ProductPromotionSimple[] =>
    data.map((item) => ({
      id: item.KM_id,
      name: item.KM_ten,
      startAt: item.KM_batDau,
      endAt: item.KM_ketThuc,
      totalProducts: item.KM_slsp,
    }));

  const fetchData = useCallback((page: number, filterType?: number, promotionId?: string) => {
    setIsLoading(true);

    if (promotionId) {
      const idNumber = Number(promotionId);
      if (Number.isNaN(idNumber)) {
        setData([]);
        setPagination([1]);
        setTotalPage(1);
        setTotalItems(0);
        setIsLoading(false);
        return;
      }

      api
        .get(`promotions/${promotionId}`)
        .then((res) => {
          const item = res.data;
          const mapped: ProductPromotionSimple = {
            id: item.KM_id,
            name: item.KM_ten,
            startAt: item.KM_batDau,
            endAt: item.KM_ketThuc,
            totalProducts: item.KM_slsp,
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
    };

    api
      .get('/promotions', { params })
      .then((res) => {
        const { data, metadata } = res.data;

        setData(mapProducts(data));
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
  }, []);

  useEffect(() => {
    fetchData(page, filterType, promotionId);
  }, [status, page, filterType, promotionId, fetchData]);

  const handlePageChange = (targetPage: number) => {
    if (targetPage !== page) {
      fetchData(targetPage, filterType, promotionId);
    }
  };

  const handleSearch = (code: string) => {
    const search = new URLSearchParams();
    search.set('status', status);
    search.set('id', code);
    router.push(`/promotions?${search.toString()}`);
  };

  const handleClearSearch = () => {
    fetchData(1, filterType);
  };

  const handleDelete = (id: number) => {
    if (!id) return;
    api
      .delete(`/promotions/${id}`)
      .then(() => {
        toast.success('Xóa thành công!');
        fetchData(page, filterType, promotionId);
      })
      .catch((error) => {
        toast.error(error.response?.status === 400 ? 'Xóa thất bại!' : 'Đã xảy ra lỗi!');
        console.error('Xóa thất bại:', error);
      });
  };

  return (
    <div className="min-w-fit p-4">
      <div className="space-y-4 bg-white min-w-fit rounded-sm shadow p-4">
        <div className="flex gap-2">
          {['end', 'live'].map((tab) => (
            <Link key={tab} href={{ pathname: `/promotions`, query: { status: tab, page: 1 } }}>
              <Button variant={status === tab ? 'default' : 'outline'} className="cursor-pointer">
                {tab === 'end' && `Đã kết thúc`}
                {tab === 'live' && `Chưa kết thúc`}
              </Button>
            </Link>
          ))}
        </div>
        <div className="flex items-center justify-between my-4">
          <h1 className="text-lg  pl-4">
            <strong>{totalItems}</strong> Khuyến mãi
          </h1>

          <Link href="/promotions/new">
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Button>
          </Link>
        </div>
        <ProductPromotionSearchBar onApply={handleSearch} onReset={handleClearSearch} />
        <ProductPromotionsTable
          data={data}
          loading={isLoading}
          onDelete={handleDelete}
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
