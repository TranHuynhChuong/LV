'use client';
import OrderList from '@/components/profile/order/order-list';
import { OrderSearchBar } from '@/components/profile/order/order-search-bar';
import { Button } from '@/components/ui/button';
import PaginationControls from '@/components/utils/pagination-controls';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/axios';
import eventBus from '@/lib/event-bus';
import {
  mapOrderOverviewListFromDto,
  OrderOverview,
  OrderOverviewDto,
  OrderStatus,
} from '@/models/order';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function Orders() {
  const { authData } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<OrderOverview[]>([]);
  const [pageNumbers, setPageNumbers] = useState<number[]>([1]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const type = (searchParams.get('type') ?? 'pending') as OrderStatus;
  const orderId = searchParams.get('orderId') ?? '';
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = 24;

  const fetchData = useCallback(
    async (page: number, filterType?: OrderStatus, orderId?: string) => {
      if (!authData.userId) return;
      try {
        if (orderId) {
          const res = await api.get(`orders/detail/${orderId}`, {
            params: { filterType },
          });
          const item = res.data;
          const mapped = mapOrderOverviewListFromDto([item as OrderOverviewDto]);
          setData(mapped);
          setPageNumbers([]);
          setTotalPages(1);
          setTotalItems(1);
          return;
        }

        const params = { page, filterType, limit };
        const res = await api.get(`orders/user/${authData.userId}`, { params });
        const { data, paginationInfo } = res.data;
        const mapped = mapOrderOverviewListFromDto(data);
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
    [authData.userId]
  );

  useEffect(() => {
    fetchData(page, type, orderId);

    const handler = () => fetchData(page, type, orderId);
    eventBus.on('order:refetch', handler);

    return () => {
      eventBus.off('order:refetch', handler);
    };
  }, [page, orderId, fetchData, type]);

  const handleSearch = (orderId: string) => {
    const search = new URLSearchParams();
    search.set('type', type);
    search.set('page', '1');
    search.set('orderId', orderId);
    router.push(`/profile/order?${search.toString()}`);
  };

  const handleClearSearch = () => {
    const search = new URLSearchParams();
    search.set('type', type);
    search.set('page', '1');
    router.push(`/profile/order?${search.toString()}`);
  };

  const handlePageChange = (targetPage: number) => {
    const search = new URLSearchParams(searchParams.toString());
    search.set('page', targetPage.toString());
    search.set('type', type);
    router.push(`/profile/order?${search.toString()}`);
  };

  return (
    <div className="w-full space-y-2">
      <div className="p-4 space-y-4 bg-white border rounded-md">
        <div className="w-full pb-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {['all', 'pending', 'toShip', 'shipping', 'complete', 'cancelRequest', 'canceled'].map(
              (tab) => (
                <Link key={tab} href={`/profile/order?type=${tab}`}>
                  <Button
                    variant={type === tab ? 'default' : 'outline'}
                    className="cursor-pointer whitespace-nowrap"
                  >
                    {tab === 'all' && `Tất cả`}
                    {tab === 'pending' && `Chờ xác nhận `}
                    {tab === 'toShip' && `Chờ vận chuyển `}
                    {tab === 'shipping' && `Đang vận chuyển `}
                    {tab === 'complete' && `Đã giao hàng `}
                    {tab === 'cancelRequest' && `Yêu cầu hủy`}
                    {tab === 'canceled' && `Đã hủy`}
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>

        <OrderSearchBar initalcode={orderId} onApply={handleSearch} onReset={handleClearSearch} />
        <div className="font-medium">{totalItems} Đơn hàng</div>
      </div>

      <div className="space-y-4 min-w-fit">
        <OrderList orders={data} />
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
