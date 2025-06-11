'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import api from '@/lib/axiosClient';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductTab from './components/productTab';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

export default function Products() {
  const [total, setTotal] = useState({ total: 0, live: 0, hidden: 0 });

  const fetchTotal = async () => {
    api.get('products/total').then((res) => setTotal(res.data));
  };

  useEffect(() => {
    fetchTotal();
  }, []);

  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Sản phẩm' }]);
  }, [setBreadcrumbs]);

  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get('status') ?? 'live';
  const page = parseInt(searchParams.get('page') ?? '1');
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
    router.push(`/products?${search.toString()}`);
  };

  const handleClearSearch = () => {
    router.push(`/products?page=1`);
  };

  const handlePageChange = (targetPage: number) => {
    const search = new URLSearchParams(searchParams.toString());
    search.set('page', targetPage.toString());
    router.push(`/products?${search.toString()}`);
  };

  return (
    <div className="p-4">
      <div className="space-y-4 bg-white p-4 rounded-sm shadow min-w-fit">
        <div className="flex gap-2">
          {['all', 'live', 'hidden'].map((tab) => (
            <Link key={tab} href={{ pathname: `/products`, query: { status: tab, page: 1 } }}>
              <Button variant={status === tab ? 'default' : 'outline'} className="cursor-pointer">
                {tab === 'all' && `Tất cả (${total.total})`}
                {tab === 'live' && `Đang hiển thị (${total.live})`}
                {tab === 'hidden' && `Đã ẩn (${total.hidden})`}
              </Button>
            </Link>
          ))}
        </div>
        <ProductTab
          status={status}
          page={page}
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
