'use client';

import { BookList } from '@/components/book/book-list';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PaginationControls from '@/components/utils/pagination-controls';
import api from '@/lib/axios-client';
import { BookOverview, BookSortType, mapBookOverviewListFromDto } from '@/models/book';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function SearchPanel() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('k') ?? '';
  const category = searchParams.get('c') ?? '';
  const page = parseInt(searchParams.get('p') ?? '1', 10);
  const rawSort = searchParams.get('s') ?? BookSortType.MostRelevant;
  const sort = Object.values(BookSortType).includes(rawSort as BookSortType)
    ? (rawSort as BookSortType)
    : BookSortType.MostRelevant;
  const [pageNumbers, setPageNumbers] = useState<number[]>([1]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [books, setBooks] = useState<BookOverview[] | []>([]);
  const pageSize = 20;

  const getData = useCallback(async () => {
    const params = {
      keyword,
      categoryId: category,
      page,
      sortType: sort,
      filterType: 'show-all',
      limit: pageSize,
    };
    try {
      const res = await api.get('/books/search', { params });
      const data = res.data;

      setBooks(mapBookOverviewListFromDto(data.data));
      setPageNumbers(data.paginationInfo.pageNumbers);
      setTotalItems(data.paginationInfo.totalItems);
      setTotalPages(data.paginationInfo.totalPages);
    } catch {
      setBooks([]);
      setPageNumbers([]);
      setTotalItems(0);
      setTotalPages(0);
    }
  }, [keyword, category, page, sort, pageSize]);

  useEffect(() => {
    getData();
  }, [getData]);

  const router = useRouter();

  const handlePageChange = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('p', targetPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleSortChange = (sortType: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sortType === BookSortType.MostRelevant) {
      params.delete('s');
    } else {
      params.set('s', sortType);
    }
    params.set('p', '1');
    router.replace(`/search?${params.toString()}`);
  };

  const showSort = keyword !== '' || category !== '';

  return (
    <div>
      <div className="flex items-center w-full p-4 bg-white rounded-md h-fit">
        <h4 className="flex-1 font-medium ">Kết quả tìm kiếm: {totalItems} sản phẩm </h4>
        {showSort && (
          <div className="flex justify-end h-fit">
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Chọn tiêu chí" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Tiêu chí</SelectLabel>
                  <SelectItem value={BookSortType.MostRelevant}>Liên quan</SelectItem>
                  <SelectItem value={BookSortType.Latest}>Mới nhất</SelectItem>
                  <SelectItem value={BookSortType.BestSelling}>Bán chạy</SelectItem>
                  <SelectItem value={BookSortType.MostRating}>Đánh giá cao - thấp</SelectItem>
                  <SelectItem value={BookSortType.PriceAsc}>Giá thấp - cao</SelectItem>
                  <SelectItem value={BookSortType.PriceDesc}>Giá cao - thấp</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="mt-4 space-y-6">
        <BookList books={books} />
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
