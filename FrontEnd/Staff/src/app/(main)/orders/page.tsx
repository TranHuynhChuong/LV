'use client';
import { useCallback, useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axiosClient';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

import PaginationControls from '@/components/utils/PaginationControls';
import { mapOrderListFromDto, Order, OrderDto } from '@/models/orders';
import { OrderSearchBar } from '@/components/orders/orderSearchBar';
import OrderList from '@/components/orders/orderList';

const typeMap: Record<string, number> = {
  all: 0,
  pending: 1,
  toship: 2,
  shipping: 3,
  complete: 4,
  cancelrequest: 6,
};

export default function Orders() {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Đơn hàng' }]);
  }, [setBreadcrumbs]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<Order[]>([]);
  const [pageNumbers, setPageNumbers] = useState<number[]>([1]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const type = searchParams.get('type') ?? 'pending';
  const orderId = searchParams.get('orderId') ?? '';
  const page = parseInt(searchParams.get('page') ?? '1');
  const filterType = typeMap[type];
  const limit = 24;
  const [total, setTotal] = useState<{
    total: number;
    pending: number;
    toship: number;
    shipping: number;
    complete: number;
    cancelrequest: number;
  }>();

  useEffect(() => {
    api
      .get('orders/total')
      .then((res) => {
        const data = res.data;
        setTotal(data);
      })
      .catch((error) => {
        console.error(error);
        setTotal({
          total: 0,
          pending: 0,
          toship: 0,
          shipping: 0,
          complete: 0,
          cancelrequest: 0,
        });
      });
  }, []);

  const fetchData = useCallback(
    async (page: number, filterType?: number, orderId?: string) => {
      try {
        if (orderId) {
          const res = await api.get(`orders/${orderId}`, { params: { filterType } });
          const item = res.data;
          const mapped = await mapOrderListFromDto([item]);

          setData(mapped);
          setPageNumbers([]);
          setTotalPages(1);
          setTotalItems(1);
          return;
        }

        const params = { page, filterType, limit };
        const res = await api.get('orders', { params });
        const { data, metadata } = res.data;
        const mapped = await mapOrderListFromDto(data as OrderDto[]);

        setData(mapped);
        setPageNumbers(metadata.pagination);
        setTotalPages(metadata.totalPage);
        setTotalItems(metadata.totalItems);
      } catch (error) {
        console.error(error); // Optional: log ra cho dễ debug
        setData([]);
        setPageNumbers([1]);
        setTotalPages(1);
        setTotalItems(0);
      }
    },
    [orderId, filterType, limit]
  );

  useEffect(() => {
    fetchData(page, filterType, orderId);
  }, [page, orderId, fetchData]);

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
      <div className="space-y-4 p-4 bg-white  border rounded-md ">
        <div className="flex pb-4 gap-2 overflow-x-auto whitespace-nowrap">
          {['all', 'pending', 'toship', 'shipping', 'complete', 'cancelrequest'].map((tab) => (
            <Link key={tab} href={`/orders?type=${tab}`}>
              <Button
                variant={type === tab ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
              >
                {tab === 'all' && `Tất cả ${total?.total}`}
                {tab === 'pending' && `Chờ xác nhận ${total?.pending}`}
                {tab === 'toship' && `Chờ vận chuyển ${total?.toship}`}
                {tab === 'shipping' && `Đang vận chuyển ${total?.shipping}`}
                {tab === 'complete' && `Đã giao hàng ${total?.complete}`}
                {tab === 'cancelrequest' && `Yêu cầu hủy ${total?.cancelrequest}`}
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
