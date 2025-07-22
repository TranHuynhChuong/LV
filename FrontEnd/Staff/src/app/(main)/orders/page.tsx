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
import { DateRange } from 'react-day-picker';
import { endOfDay, startOfDay } from 'date-fns';
import { RotateCcw, Search } from 'lucide-react';
import DateRangePicker from '@/components/utils/DateRangePicker';

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

  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';

  const [range, setRange] = useState<DateRange | undefined>();

  useEffect(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    setRange({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }, [searchParams.toString()]);

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
    async (
      page: number,
      filterType?: OrderStatus,
      orderId?: string,
      from?: string,
      to?: string
    ) => {
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

        const params = {
          page: page,
          filterType: filterType,
          limit: limit,
          from: from,
          to: to,
        };
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

  async function fetchOrderTotal(from?: string, to?: string) {
    try {
      const params = {
        from: from,
        to: to,
      };

      const res = await api.get('orders/total', { params });
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
    fetchOrderTotal(from, to);

    const handler = () => fetchOrderTotal(from, to);
    eventBus.on('order:refetch', handler);

    return () => {
      eventBus.off('order:refetch', handler);
    };
  }, [from, to]);

  useEffect(() => {
    fetchData(page, type, orderId, from, to);

    const handler = () => fetchData(page, type, orderId, from, to);
    eventBus.on('order:refetch', handler);

    return () => {
      eventBus.off('order:refetch', handler);
    };
  }, [page, orderId, fetchData, type, from, to]);

  const handleSearch = (orderId?: string, range?: DateRange) => {
    const search = new URLSearchParams();
    search.set('type', type);
    search.set('page', '1');
    if (orderId) search.set('orderId', orderId);

    if (range && range.from && range.to) {
      search.set('from', startOfDay(range.from).toDateString());
      search.set('to', endOfDay(range.to).toDateString());
    }

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
      <div className="flex flex-wrap items-center justify-end bg-white rounded-md px-4 py-2 border">
        <div className="flex flex-1 gap-2 my-2">
          <DateRangePicker date={range} onChange={setRange} />
        </div>

        {/* Nút hành động */}
        <div className="flex gap-2 justify-end ml-8 my-2">
          <Button onClick={() => handleSearch(undefined, range)}>
            <Search className="mr-1 w-4 h-4" />
            Tìm kiếm
          </Button>

          <Button variant="outline" onClick={handleClearSearch}>
            <RotateCcw className="mr-1 w-4 h-4" />
            Đặt lại
          </Button>
        </div>
      </div>
      <div className="p-4 space-y-4 bg-white border rounded-md ">
        <div className="flex gap-2 pb-4 overflow-x-auto whitespace-nowrap">
          {['all', 'pending', 'toShip', 'shipping', 'complete', 'cancelRequest', 'canceled'].map(
            (tab) => (
              <Link key={tab} href={`/orders?type=${tab}&from=${from}&to=${to}`}>
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
                  {tab === 'canceled' && `Đã hủy ${total?.canceled}`}
                </Button>
              </Link>
            )
          )}
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
