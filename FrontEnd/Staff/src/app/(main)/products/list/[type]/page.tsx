'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import api from '@/lib/axiosClient';
import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import ProductTab from '../../components/productTab';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

export default function ProductsListType() {
  const params = useParams();
  const type = params.type as 'all' | 'live' | 'hidden';

  const [total, setTotal] = useState({
    all: { total: 0, in: 0, out: 0 },
    live: { total: 0, in: 0, out: 0 },
    hidden: { total: 0, in: 0, out: 0 },
  });

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

  const status = searchParams.get('status') ?? 'all';
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
                {tab === 'all' && `Tất cả (${total.all.total})`}
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
                {tab === 'all' && `Tất cả (${total[type].total})`}
                {tab === 'in' && `Còn hàng (${total[type].in})`}
                {tab === 'out' && `Hết hàng (${total[type].out})`}
              </Button>
            </Link>
          ))}
        </div>
        <ProductTab
          status={status}
          page={page}
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
