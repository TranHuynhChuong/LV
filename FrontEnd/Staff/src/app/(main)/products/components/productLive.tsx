'use client';

import { useEffect, useState } from 'react';
import ProductTable from '../components/productTab';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import PaginationControls from '@/components/PaginationControls';
import api from '@/lib/axiosClient';
import { ApiProductSimple, ProductSimple } from '@/type/Product';

export default function ProductLive() {
  const [data, setData] = useState<ProductSimple[]>([]);
  const [paginate, setPaginate] = useState<number[]>([1]);
  const [currentPage, setCurrentPage] = useState(1);
  const [cursorId, setCursorId] = useState<string | undefined>(undefined);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 24;

  const fetchData = (mode: 'head' | 'tail' | 'cursor', targetPage?: number, cursor?: string) => {
    setIsLoading(true);
    let params;
    if (targetPage && cursor) {
      params = {
        mode,
        cursorId: cursor,
        currentPage,
        targetPage,
        limit,
      };
    } else {
      params = {
        mode,
        limit,
      };
    }

    return api
      .get('/products', {
        params: params,
      })
      .then((res) => {
        const { data, paginate, currentPage, cursorId, totalPage, totalItems } = res.data;

        if (!data.length) {
          setData([]);
          setPaginate([1]);
          return;
        }

        const mapped: ProductSimple[] = data.map((item: ApiProductSimple) => ({
          id: item.SP_id,
          name: item.SP_ten,
          price: item.SP_giaBan,
          stock: item.SP_tonKho,
          cost: item.SP_giaNhap,
          sold: item.SP_daBan,
          image: item.SP_anh,
        }));

        setData(mapped);
        setPaginate(paginate);
        setCurrentPage(currentPage);
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

  // Khởi tạo dữ liệu khi load trang hoặc khi currentPage thay đổi
  useEffect(() => {
    // luôn bắt đầu bằng mode 'head' nếu chưa có cursorId, hoặc mode 'cursor' nếu có
    if (!cursorId) {
      fetchData('head');
    } else {
      fetchData('cursor', currentPage, cursorId);
    }
  }, [currentPage]);

  // Xử lý click chuyển trang pagination shadcn
  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    fetchData('cursor', page, cursorId);
  };
  const handleFirstPage = () => {
    fetchData('head');
  };
  const handleLastPage = () => {
    fetchData('head');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pl- my-4">
        <h1 className="text-xl font-semibold ">{totalItems} sản phẩm</h1>
        <Link href="products/new">
          <Button className="cursor-pointer">
            <Plus /> Thêm mới
          </Button>
        </Link>
      </div>
      <ProductTable data={data} loading={isLoading} />
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
