// app/search/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/axiosClient';
import PaginationControls from '@/components/PaginationControls';
import { ApiMetadate, ApiProductSimple, ProductSimple, ApiResponse } from '@/types/products';
import { ProductList } from '@/components/product/productList';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function mapProductList(apiRes: {
  data: ApiProductSimple[];
  metadata: ApiMetadate;
}): ProductSimple[] {
  const { data } = apiRes;

  return data.map((item) => {
    const selePrice = item.SP_giaGiam === item.SP_giaBan ? undefined : item.SP_giaGiam;
    const discountPercent = selePrice
      ? Math.round(((item.SP_giaBan - item.SP_giaGiam) / item.SP_giaBan) * 100)
      : undefined;

    return {
      id: item.SP_id,
      name: item.SP_ten,
      price: item.SP_giaBan,
      cost: item.SP_giaNhap,
      sold: item.SP_daBan,
      stock: item.SP_tonKho,
      image: item.SP_anh,
      status: item.SP_trangThai,
      score: item.SP_diemDG,
      categories: item.TL_id,
      selePrice: selePrice,
      discountPercent: discountPercent,
    };
  });
}

export default function SearchPage() {
  const searchParams = useSearchParams();

  const keyword = searchParams.get('k') || '';
  const category = searchParams.get('c') || '';
  const page = parseInt(searchParams.get('p') || '1', 10);
  const sort = searchParams.get('s') || '0'; // 0 | 1 | 2 | 3 | -3

  const [pagination, setPagination] = useState<number[]>([1]);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [products, setProducts] = useState<ProductSimple[] | []>([]);

  const pageSize = 24;

  const fetchData = useCallback(async () => {
    const params = {
      keyword,
      categoryId: category,
      page,
      sortType: sort,
      filterType: '1',
      limit: pageSize,
    };

    try {
      const res = await api.get('/products/search', { params });
      const ApiResponse: ApiResponse = res.data;
      const products: ProductSimple[] = mapProductList(ApiResponse);
      setProducts(products);
      setPagination(ApiResponse.metadata.pagination);
      setTotalItems(ApiResponse.metadata.totalItems);
      setTotalPage(ApiResponse.metadata.totalPage);
    } catch {
      setProducts([]);
      setPagination([]);
      setTotalItems(0);
      setTotalPage(0);
    }
  }, [keyword, category, page, sort, pageSize]); // 👈 thêm pageSize vào deps nếu nó thay đổi

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const router = useRouter();

  const handlePageChange = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set('p', targetPage.toString()); // cập nhật `p`
    router.push(`?${params.toString()}`); // đẩy đường dẫn mới
  };

  const handleSortChange = (sortType: string) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set('s', sortType); // cập nhật sortType vào query `s`
    params.set('p', '1'); // reset về trang đầu nếu cần

    // push tới URL mới
    router.push(`/search?${params.toString()}`);
  };
  return (
    <div>
      <div className="w-full h-fit flex p-4 items-center bg-white rounded-md">
        <h4 className="font-medium flex-1 ">Kết quả tìm kiếm: {totalItems}</h4>
        <div className="h-fit justify-end flex">
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Chọn tiêu chí" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Tiêu chí</SelectLabel>
                <SelectItem value="0">Liên quan</SelectItem>
                <SelectItem value="1">Mới nhất</SelectItem>
                <SelectItem value="2">Bán chạy</SelectItem>
                <SelectItem value="3">Giá thấp - cao</SelectItem>
                <SelectItem value="4">Giá cao - thấp</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-6 mt-4">
        <ProductList products={products} />
        <PaginationControls
          pagination={pagination}
          currentPage={page}
          totalPage={totalPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
