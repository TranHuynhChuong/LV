'use client';

import { BookTab } from '@/components/books/book-tab-dynamic-import';
import { Button } from '@/components/ui/button';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import eventBus from '@/lib/event-bus';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BookPanel() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Sách' }]);
  }, [setBreadcrumbs]);
  const [total, setTotal] = useState({
    live: { total: 0, in: 0, out: 0 },
    hidden: { total: 0, in: 0, out: 0 },
  });

  async function getTotal() {
    try {
      const res = await api.get('books/total');
      setTotal(res.data);
    } catch {
      setTotal({
        live: { total: 0, in: 0, out: 0 },
        hidden: { total: 0, in: 0, out: 0 },
      });
    }
  }

  useEffect(() => {
    getTotal();
    const handler = () => getTotal();
    eventBus.on('book:refetch', handler);
    return () => {
      eventBus.off('book:refetch', handler);
    };
  }, []);

  const router = useRouter();
  const searchParams = useSearchParams();
  const type = (searchParams.get('type') ?? 'live') as 'live' | 'hidden' | 'all';
  const status = searchParams.get('status') ?? 'all';
  const currentPage = parseInt(searchParams.get('page') ?? '1');
  const keyword = searchParams.get('keyword') ?? undefined;
  const bookId = searchParams.get('bookId') ?? undefined;
  const categoryId = searchParams.get('categoryId') ?? undefined;

  const handleSearch = (search: {
    type?: 'id' | 'keyword';
    keyword?: string;
    categoryId?: string;
  }) => {
    const params = new URLSearchParams();
    params.set('status', status);
    params.set('type', type);
    params.set('page', '1');
    if (search.type === 'id' && search.keyword) {
      params.set('bookId', search.keyword);
    } else if (search.type === 'keyword') {
      if (search.keyword) params.set('keyword', search.keyword);
      if (search.categoryId) params.set('categoryId', search.categoryId);
    }
    router.replace(`/books/list?${params.toString()}`);
  };

  const handleClearSearch = () => {
    const params = new URLSearchParams();
    params.set('status', status);
    params.set('type', type);
    router.replace(`/books/list?page=1`);
  };

  const handlePageChange = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', targetPage.toString());
    router.push(`/books/list?${params.toString()}`);
  };

  const handleStatusChange = (s: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('status', s);
    params.set('page', '1');
    params.set('type', type);
    router.replace(`/books/list?${params.toString()}`);
  };

  const handleTabChange = (t: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', t);
    params.set('status', status);
    params.set('page', '1');
    router.replace(`/books/list?${params.toString()}`);
  };

  return (
    <div className="p-4 space-y-2">
      <div className="p-4 space-y-4 bg-white rounded-sm shadow min-w-fit">
        <div className="flex gap-2">
          {['all', 'live', 'hidden'].map((tab) => (
            <Button
              key={tab}
              variant={type === tab ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleTabChange(tab)}
            >
              {tab === 'all' && `Tất cả (${total.live.total + total.hidden.total})`}
              {tab === 'live' && `Đang hiển thị (${total.live.total})`}
              {tab === 'hidden' && `Đã ẩn (${total.hidden.total})`}
            </Button>
          ))}
        </div>
      </div>
      <div className="p-4 space-y-4 bg-white rounded-sm shadow min-w-fit">
        <div className="flex gap-2">
          {['all', 'in', 'out'].map((s) => {
            let count = 0;
            if (s === 'all') {
              count = type === 'all' ? total.live.total + total.hidden.total : total[type].total;
            } else if (s === 'in') {
              count = type === 'all' ? total.live.in + total.hidden.in : total[type].in;
            } else if (s === 'out') {
              count = type === 'all' ? total.live.out + total.hidden.out : total[type].out;
            }
            return (
              <Button
                key={s}
                variant={status === s ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleStatusChange(s)}
              >
                {s === 'all' && `Tất cả (${count})`}
                {s === 'in' && `Còn hàng (${count})`}
                {s === 'out' && `Hết hàng (${count})`}
              </Button>
            );
          })}
        </div>
        <BookTab
          status={status}
          currentPage={currentPage}
          type={type}
          keyword={keyword}
          bookId={bookId}
          categoryId={categoryId}
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
