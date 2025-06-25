// app/search/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/axiosClient';
import PaginationControls from '@/components/utils/PaginationControls';

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
import { mapProductOverviewListFromDto, ProductOverview, ProductSortType } from '@/models/products';

export default function SearchPage() {
  const searchParams = useSearchParams();

  const keyword = searchParams.get('k') ?? '';
  const category = searchParams.get('c') ?? '';
  const page = parseInt(searchParams.get('p') ?? '1', 10);

  const rawSort = searchParams.get('s') ?? '';
  const sort = Object.values(ProductSortType).includes(rawSort as ProductSortType)
    ? (rawSort as ProductSortType)
    : undefined;

  const [pageNumbers, setPageNumbers] = useState<number[]>([1]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [products, setProducts] = useState<ProductOverview[] | []>([]);

  const pageSize = 24;

  const fetchData = useCallback(async () => {
    const params = {
      keyword,
      categoryId: category,
      page,
      sortType: sort,
      filterType: '11',
      limit: pageSize,
    };

    try {
      const res = await api.get('/products/search', { params });
      const data = res.data;

      setProducts(mapProductOverviewListFromDto(data.data));
      setPageNumbers(data.paginationInfo.pageNumbers);
      setTotalItems(data.paginationInfo.totalItems);
      setTotalPages(data.paginationInfo.totalPages);
    } catch {
      setProducts([]);
      setPageNumbers([]);
      setTotalItems(0);
      setTotalPages(0);
    }
  }, [keyword, category, page, sort, pageSize]);

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

    if (sortType === ProductSortType.MostRelevant) {
      params.delete('s');
    } else {
      params.set('s', sortType);
    }

    params.set('p', '1');

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
                <SelectItem value={ProductSortType.MostRelevant}>Liên quan</SelectItem>
                <SelectItem value={ProductSortType.Latest}>Mới nhất</SelectItem>
                <SelectItem value={ProductSortType.BestSelling}>Bán chạy</SelectItem>
                <SelectItem value={ProductSortType.PriceAsc}>Giá thấp - cao</SelectItem>
                <SelectItem value={ProductSortType.PriceDesc}>Giá cao - thấp</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-6 mt-4">
        <ProductList products={products} />
        <PaginationControls
          pageNumbers={pageNumbers}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
