'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import api from '@/lib/axios';
import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import ProductTab from '@/components/products/productTab';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import eventBus from '@/lib/eventBus';

export default function ProductsListType() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Sản phẩm' }]);
  }, [setBreadcrumbs]);

  const params = useParams();
  const type = params.type as 'all' | 'live' | 'hidden';

  const [total, setTotal] = useState({
    live: { total: 0, in: 0, out: 0 },
    hidden: { total: 0, in: 0, out: 0 },
  });

  async function fetchTotal() {
    try {
      const res = await api.get('products/total');
      setTotal(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchTotal();

    const handler = () => fetchTotal();
    eventBus.on('product:refetch', handler);

    return () => {
      eventBus.off('product:refetch', handler);
    };
  }, []);

  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get('status') ?? 'all';
  const currentPage = parseInt(searchParams.get('page') ?? '1');
  const keyword = searchParams.get('keyword') ?? undefined;
  const productId = searchParams.get('productId') ?? undefined;
  const categoryId = searchParams.get('categoryId') ?? undefined;

  const handleSearch = (param: {
    type?: 'id' | 'keyword';
    keyword?: string;
    categoryId?: string;
  }) => {
    const search = new URLSearchParams();
    search.set('status', status);
    search.set('page', '1');
    if (param.type === 'id' && param.keyword) {
      search.set('productId', param.keyword);
    } else if (param.type === 'keyword') {
      if (param.keyword) search.set('keyword', param.keyword);
      if (param.categoryId) search.set('categoryId', param.categoryId);
    }
    router.push(`/products/list/${type}?${search.toString()}`);
  };

  const handleClearSearch = () => {
    router.push(`/products/list/${type}?page=1`);
  };

  const handlePageChange = (targetPage: number) => {
    const search = new URLSearchParams(searchParams.toString());
    search.set('page', targetPage.toString());
    router.push(`/products/all?${search.toString()}`);
  };

  const pathname = usePathname();

  return (
    <div className="p-4 space-y-2">
      <div className="space-y-4 bg-white p-4 rounded-sm shadow min-w-fit">
        <div className="flex gap-2">
          {['all', 'live', 'hidden'].map((tab) => (
            <Link key={tab} href={{ pathname: `/products/list/${tab}` }}>
              <Button
                variant={pathname.includes(`/products/list/${tab}`) ? 'default' : 'outline'}
                className="cursor-pointer"
              >
                {tab === 'all' && `Tất cả (${total.live.total + total.hidden.total})`}
                {tab === 'live' && `Đang hiển thị (${total.live.total})`}
                {tab === 'hidden' && `Đã ẩn (${total.hidden.total})`}
              </Button>
            </Link>
          ))}
        </div>
      </div>
      <div className="space-y-4 bg-white p-4 rounded-sm shadow min-w-fit">
        <div className="flex gap-2">
          {['all', 'in', 'out'].map((tab) => (
            <Link
              key={tab}
              href={{ pathname: `/products/list/${type}`, query: { status: tab, page: 1 } }}
            >
              <Button variant={status === tab ? 'default' : 'outline'} className="cursor-pointer">
                {tab === 'all' &&
                  `Tất cả (${
                    type === 'all' ? total.live.total + total.hidden.total : total[type].total
                  })`}
                {tab === 'in' &&
                  `Còn hàng (${type === 'all' ? total.live.in + total.hidden.in : total[type].in})`}
                {tab === 'out' &&
                  `Hết hàng (${
                    type === 'all' ? total.live.out + total.hidden.out : total[type].out
                  })`}
              </Button>
            </Link>
          ))}
        </div>
        <ProductTab
          status={status}
          currentPage={currentPage}
          type={type}
          keyword={keyword}
          productId={productId}
          categoryId={categoryId}
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
