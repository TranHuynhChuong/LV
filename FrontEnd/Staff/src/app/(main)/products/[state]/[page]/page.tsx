'use client';

import ProductTable from '../../components/productTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import PaginationControls from '@/components/PaginationControls';
import api from '@/lib/axiosClient';
import { ApiProductSimple, ProductSimple } from '@/type/Product';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

const filterMap: Record<string, number | undefined> = {
  all: undefined,
  live: 1,
  hidden: 2,
};

export default function ProductTab() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Sản phẩm' }]);
  }, [setBreadcrumbs]);

  const [data, setData] = useState<ProductSimple[]>([]);
  const [paginate, setPaginate] = useState<number[]>([1]);
  const [cursorId, setCursorId] = useState<string | undefined>(undefined);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 24;

  const [total, setTotal] = useState<{ total: number; live: number; hidden: number }>({
    total: 0,
    live: 0,
    hidden: 0,
  });
  const params = useParams();
  const router = useRouter();

  const state = String(params?.state ?? 'all');
  const currentPage = isNaN(Number(params?.page)) ? 1 : Number(params.page);

  const filterType = filterMap[state] ?? undefined;

  const fetchData = async (
    mode: 'head' | 'tail' | 'cursor',
    cursor?: string,
    targetPage?: number
  ) => {
    setIsLoading(true);
    const params = {
      mode,
      limit,
      filterType,
      ...(cursor && { cursorId: cursor }),
      ...(targetPage && { targetPage }),
      ...(currentPage && { currentPage }),
    };

    return api
      .get('/products', { params })
      .then((res) => {
        const { data, paginate, cursorId, totalPage, totalItems } = res.data;

        const mapped: ProductSimple[] = data.map((item: ApiProductSimple) => ({
          id: item.SP_id,
          name: item.SP_ten,
          price: item.SP_giaBan,
          stock: item.SP_tonKho,
          cost: item.SP_giaNhap,
          sold: item.SP_daBan,
          image: item.SP_anh,
          state: item.SP_trangThai,
        }));

        setData(mapped);
        setPaginate(paginate);
        setCursorId(cursorId);
        setTotalPage(totalPage);
        setTotalItems(totalItems);
      })
      .catch(() => {
        setData([]);
        setPaginate([1]);
      })
      .finally(() => setIsLoading(false));
  };

  const fetchTotal = async () => {
    api.get('products/total').then((res) => setTotal(res.data));
  };

  useEffect(() => {
    if (cursorId && currentPage > 1) {
      fetchData('cursor', cursorId, currentPage);
    } else {
      setCursorId(undefined); // reset cursor
      fetchData('head');
      fetchTotal();
    }
  }, [state, currentPage]);

  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    router.push(`/products/${state}/${page}`);
  };

  const handleFirstPage = () => router.push(`/products/${state}/1`);
  const handleLastPage = () => router.push(`/products/${state}/${totalPage}`);

  const handleDelete = (id: number) => {
    if (!id) return;
    api
      .delete(`/products/${id}`)
      .then(() => {
        toast.success('Xóa thành công!');
        fetchData('cursor', cursorId, currentPage);
        fetchTotal();
      })
      .catch((error) => {
        if (error.response?.status === 400) {
          toast.error('Xóa thất bại!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
        console.error('Xóa thất bại:', error);
      });
  };

  return (
    <div className="space-y-4 bg-white p-4 rounded-sm shadow">
      {/* Tabs trạng thái */}
      <div className="flex gap-2">
        {['all', 'live', 'hidden'].map((tab) => (
          <Button
            key={tab}
            variant={state === tab ? 'default' : 'outline'}
            onClick={() => router.push(`/products/${tab}/1`)}
          >
            {tab === 'all' && `Tất cả (${total.total})`}
            {tab === 'live' && `Đang hiển thị (${total.live})`}
            {tab === 'hidden' && `Đã ẩn (${total.hidden})`}
          </Button>
        ))}
      </div>
      <div className="flex items-center justify-between my-4">
        <h1 className="text-lg font-semibold pl-4">{totalItems} Sản phẩm</h1>
        <Link href="/products/new">
          <Button className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" /> Thêm mới
          </Button>
        </Link>
      </div>
      <ProductTable data={data} loading={isLoading} onDelete={handleDelete} />
      <PaginationControls
        paginate={paginate}
        totalPage={totalPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onFirstPage={handleFirstPage}
        onLastPage={handleLastPage}
      />
    </div>
  );
}
