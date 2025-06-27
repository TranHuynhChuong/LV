'use client';
import { useCallback, useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

import PaginationControls from '@/components/utils/PaginationControls';
import {
  mapOrderOverviewListFromDto,
  OrderOverview,
  OrderOverviewDto,
  OrderStatus,
} from '@/models/orders';
import { OrderSearchBar } from '@/components/orders/orderSearchBar';
import OrderList from '@/components/orders/orderList';
import eventBus from '@/lib/eventBus';

export default function Orders() {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Đơn hàng' }]);
  }, [setBreadcrumbs]);

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
  const [total, setTotal] = useState<{
    total: number;
    pending: number;
    toShip: number;
    shipping: number;
    complete: number;
    inComplete: number;
    cancelRequest: number;
    canceled: number;
  }>({
    total: 0,
    pending: 0,
    toShip: 0,
    shipping: 0,
    complete: 0,
    inComplete: 0,
    cancelRequest: 0,
    canceled: 0,
  });

  const fetchData = useCallback(
    async (page: number, filterType?: OrderStatus, orderId?: string) => {
      try {
        if (orderId) {
          const res = await api.get(`orders/${orderId}`, {
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
        const res = await api.get('orders', { params });
        const { data, paginationInfo } = res.data;
        const mapped = mapOrderOverviewListFromDto(data);

        setData(mapped);
        setPageNumbers(paginationInfo.pageNumbers);
        setTotalPages(paginationInfo.totalPage);
        setTotalItems(paginationInfo.totalItems);
      } catch (error) {
        console.error(error);
        setData([]);
        setPageNumbers([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    },
    []
  );

  async function fetchOrderTotal() {
    try {
      const res = await api.get('orders/total');
      const data = res.data;
      setTotal(data);
    } catch (error) {
      console.error(error);
      setTotal({
        total: 0,
        pending: 0,
        toShip: 0,
        shipping: 0,
        complete: 0,
        inComplete: 0,
        cancelRequest: 0,
        canceled: 0,
      });
    }
  }

  useEffect(() => {
    fetchOrderTotal();

    const handler = () => fetchOrderTotal();
    eventBus.on('order:refetch', handler);

    return () => {
      eventBus.off('order:refetch', handler);
    };
  }, []);

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
    router.push(`/orders?${search.toString()}`);
  };

  const handleClearSearch = () => {
    const search = new URLSearchParams();
    search.set('type', type);
    search.set('page', '1');
    router.push(`/orders?${search.toString()}`);
  };

  const handlePageChange = (targetPage: number) => {
    const search = new URLSearchParams(searchParams.toString());
    search.set('page', targetPage.toString());
    search.set('type', type);
    router.push(`/orders?${search.toString()}`);
  };

  return (
    <div className="p-4 space-y-2">
      <div className="p-4 space-y-4 bg-white border rounded-md ">
        <div className="flex gap-2 pb-4 overflow-x-auto whitespace-nowrap">
          {['all', 'pending', 'toShip', 'shipping', 'complete', 'cancelRequest'].map((tab) => (
            <Link key={tab} href={`/orders?type=${tab}`}>
              <Button
                variant={type === tab ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
              >
                {tab === 'all' && `Tất cả ${total?.total}`}
                {tab === 'pending' && `Chờ xác nhận ${total?.pending}`}
                {tab === 'toShip' && `Chờ vận chuyển ${total?.toShip}`}
                {tab === 'shipping' && `Đang vận chuyển ${total?.shipping}`}
                {tab === 'complete' && `Đã giao hàng ${total?.complete + total?.inComplete}`}
                {tab === 'cancelRequest' && `Yêu cầu hủy ${total?.cancelRequest}`}
              </Button>
            </Link>
          ))}
        </div>

        <OrderSearchBar initalcode={orderId} onApply={handleSearch} onReset={handleClearSearch} />
        <div className="font-medium">{totalItems} Đơn hàng</div>
      </div>

      <div className="space-y-4 min-w-fit ">
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
