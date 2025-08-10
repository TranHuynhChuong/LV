'use client';
import OrderList from '@/components/orders/order-list';
import { OrderSearchBar } from '@/components/orders/order-searchbar';
import { Button } from '@/components/ui/button';
import DateRangePicker from '@/components/utils/date-range-picker';
import PaginationControls from '@/components/utils/pagination-controls';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import eventBus from '@/lib/event-bus';
import { mapOrderOverviewListFromDto, OrderOverview, OrderStatus } from '@/models/orders';
import { endOfDay, startOfDay } from 'date-fns';
import { RotateCcw, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';

export default function OrderPanel() {
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
  const [range, setRange] = useState<DateRange | undefined>();
  const type = (searchParams.get('type') ?? 'pending') as OrderStatus;
  const orderId = searchParams.get('orderId') ?? '';
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = 12;
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';

  useEffect(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    setRange({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }, [searchParams]);

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

  const getData = useCallback(
    async (
      page: number,
      filterType?: OrderStatus,
      orderId?: string,
      from?: string,
      to?: string
    ) => {
      try {
        const params = {
          page: page,
          filterType: filterType,
          orderId: orderId,
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
      } catch {
        setData([]);
        setPageNumbers([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    },
    []
  );

  async function getOrderTotal(from?: string, to?: string) {
    try {
      const params = {
        from: from,
        to: to,
      };
      const res = await api.get('orders/total', { params });
      const data = res.data;
      setTotal(data);
    } catch {
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
    getOrderTotal(from, to);
    const handler = () => getOrderTotal(from, to);
    eventBus.on('order:refetch', handler);
    return () => {
      eventBus.off('order:refetch', handler);
    };
  }, [from, to]);

  useEffect(() => {
    getData(page, type, orderId, from, to);
    const handler = () => getData(page, type, orderId, from, to);
    eventBus.on('order:refetch', handler);
    return () => {
      eventBus.off('order:refetch', handler);
    };
  }, [page, orderId, getData, type, from, to]);

  const handleSearch = (orderId?: string, range?: DateRange) => {
    const search = new URLSearchParams();
    search.set('type', type);
    search.set('page', '1');
    if (orderId) search.set('orderId', orderId);

    if (range?.from && range?.to) {
      search.set('from', startOfDay(range.from).toDateString());
      search.set('to', endOfDay(range.to).toDateString());
    }

    router.replace(`/orders?${search.toString()}`);
  };

  const handleClearSearch = (searchType: 'date' | 'id') => {
    const search = new URLSearchParams(searchParams);
    search.set('type', type);
    search.set('page', '1');
    if (searchType === 'id') search.delete('orderId');
    else if (searchType === 'date') {
      search.delete('from');
      search.delete('to');
    }
    router.replace(`/orders?${search.toString()}`);
  };

  const handlePageChange = (targetPage: number) => {
    const search = new URLSearchParams(searchParams.toString());
    search.set('page', targetPage.toString());
    search.set('type', type);
    router.push(`/orders?${search.toString()}`);
  };

  const tabs = ['all', 'pending', 'toShip', 'shipping', 'complete', 'cancelRequest', 'canceled'];

  return (
    <div className="p-4 space-y-2">
      <div className="flex flex-wrap items-center justify-end px-4 py-2 bg-white border rounded-md">
        <div className="flex flex-1 gap-2 my-2">
          <DateRangePicker date={range} onChange={setRange} />
        </div>
        <div className="flex justify-end gap-2 my-2 ml-8">
          <Button onClick={() => handleSearch(orderId, range)} className="cursor-pointer">
            <Search className="w-4 h-4 mr-1" />
            Tìm kiếm
          </Button>
          <Button
            variant="outline"
            onClick={() => handleClearSearch('date')}
            className="cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Đặt lại
          </Button>
        </div>
      </div>
      <div className="p-4 space-y-4 bg-white border rounded-md ">
        <div className="flex gap-2 pb-4 overflow-x-auto whitespace-nowrap">
          {tabs.map((tab) => {
            const queryParams = new URLSearchParams(searchParams.toString());
            queryParams.set('type', tab);
            const href = `/orders?${queryParams.toString()}`;
            return (
              <Button
                key={tab}
                variant={type === tab ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => {
                  router.replace(href);
                }}
              >
                {tab === 'all' && `Tất cả ${total?.total}`}
                {tab === 'pending' && `Chờ xác nhận ${total?.pending}`}
                {tab === 'toShip' && `Chờ vận chuyển ${total?.toShip}`}
                {tab === 'shipping' && `Đang vận chuyển ${total?.shipping}`}
                {tab === 'complete' && `Đã giao hàng ${total?.complete + total?.inComplete}`}
                {tab === 'cancelRequest' && `Yêu cầu hủy ${total?.cancelRequest}`}
                {tab === 'canceled' && `Đã hủy ${total?.canceled}`}
              </Button>
            );
          })}
        </div>
        <OrderSearchBar
          initalcode={orderId}
          onApply={(id) => handleSearch(id, range)}
          onReset={() => handleClearSearch('id')}
        />
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
