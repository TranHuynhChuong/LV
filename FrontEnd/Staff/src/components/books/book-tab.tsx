'use client';

import BookTable from './book-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import api from '@/lib/axios';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import BookSearchBar from './book-searchbar';
import Loader from '@/components/utils/loader';
import { useAuth } from '@/contexts/auth-context';

import { mapBooksOverviewFromDto, BookFilterType, BookOverView } from '@/models/books';
import eventBus from '@/lib/event-bus';

type BookTabProp = {
  status: string;
  type?: string;
  currentPage: number;
  bookId?: string;
  categoryId?: string;
  keyword?: string;
  onSearch?: (param: { type?: 'id' | 'keyword'; keyword?: string; categoryId?: string }) => void;
  onClearSearch?: () => void;
  onPageChange?: (page: number) => void;
  onClose?: () => void;
  selectedData?: BookOverView[];
  products?: BookOverView[];
  onConfirmSelect?: (selecData: BookOverView[]) => void;
};

function buildFilterType(status: string, type: string): BookFilterType {
  if (status === 'noPromotion') return BookFilterType.ExcludeActivePromotion;

  const prefixMap: Record<string, string> = {
    live: 'show',
    hidden: 'hidden',
    all: 'all',
  };

  const suffixMap: Record<string, string> = {
    all: 'all',
    in: 'in-stock',
    out: 'out-of-stock',
  };

  const prefix = prefixMap[type];
  const suffix = suffixMap[status];

  return `${prefix}-${suffix}` as BookFilterType;
}

export default function BookTab({
  status,
  type = 'live',
  currentPage,
  bookId: initialBookId = undefined,
  categoryId: initialCategoryId = undefined,
  keyword: initialKeyword = undefined,
  onSearch,
  onClearSearch,
  onPageChange,
  onClose,
  selectedData,
  onConfirmSelect,
}: Readonly<BookTabProp>) {
  const [data, setData] = useState<BookOverView[]>([]);
  const [pageNumbers, setPageNumbers] = useState<number[]>([1]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyword, setKeyword] = useState<string | undefined>(initialKeyword);
  const [categoryId, setCategoryId] = useState<string | undefined>(initialCategoryId);
  const [bookId, setBookId] = useState<string | undefined>(initialBookId);
  const [page, setPage] = useState<number>(currentPage);
  const searchType = bookId ? 'id' : keyword || categoryId ? 'keyword' : undefined;
  const { authData } = useAuth();
  const [isComponent, setIsComponent] = useState<boolean>(false);
  const sortType = undefined;
  const filterType = buildFilterType(status, type);
  const limit = 12;

  const fetchData = useCallback(
    async (
      page: number,
      sortType?: number,
      filterType?: BookFilterType,
      keyword?: string,
      categoryId?: string,
      bookId?: string
    ) => {
      setIsLoading(true);

      if (bookId) {
        try {
          const res = await api.get(`books/isbn/${bookId}`, {
            params: { filterType: filterType },
          });
          const item = res.data;
          if (!item) throw new Error();
          setData(mapBooksOverviewFromDto([item]));
          setPageNumbers([]);
          setTotalPages(1);
          setTotalItems(1);
        } catch (error) {
          console.log(error);
          handleError();
        } finally {
          setIsLoading(false);
        }

        return;
      }

      try {
        const params = {
          page,
          sortType,
          filterType: filterType,
          limit,
          keyword,
          categoryId,
        };

        const url = keyword || categoryId ? '/books/search' : '/books';
        const res = await api.get(url, { params });

        const { data, paginationInfo } = res.data;
        setData(mapBooksOverviewFromDto(data));
        setPageNumbers(paginationInfo.pageNumbers);
        setTotalPages(paginationInfo.totalPages);
        setTotalItems(paginationInfo.totalItems);
      } catch (error) {
        console.log(error);
        handleError();
      } finally {
        setIsLoading(false);
      }
    },
    [keyword, categoryId, bookId, page, status]
  );

  const handleError = () => {
    setData([]);
    setPageNumbers([1]);
    setTotalPages(1);
    setTotalItems(0);
  };

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (status === 'noPromotion') setIsComponent(true);
  }, [status]);

  useEffect(() => {
    fetchData(page, sortType, filterType, keyword, categoryId, bookId);
  }, [fetchData]);

  useEffect(() => {
    if (!isComponent) {
      setKeyword(initialKeyword);
      setCategoryId(initialCategoryId);
      setBookId(initialBookId);
    }
  }, [initialKeyword, initialCategoryId, initialBookId, isComponent]);

  const handlePageChange = (targetPage: number) => {
    if (targetPage !== page) {
      if (!isComponent) {
        onPageChange?.(targetPage);
      } else {
        setPage(targetPage);
      }
    }
  };

  const handleSearch = (param: {
    type: 'id' | 'keyword';
    keyword?: string;
    categoryId?: string;
  }) => {
    if (onSearch) {
      onSearch?.(param);
    } else if (param.type === 'id') {
      setBookId(param.keyword);
      setCategoryId(undefined);
      setKeyword(undefined);
    } else if (param.type === 'keyword') {
      setBookId(undefined);
      setCategoryId(param.categoryId);
      setKeyword(param.keyword);
    } else {
      setBookId(undefined);
      setCategoryId(undefined);
      setKeyword(undefined);
    }
  };

  const handleClearSearch = () => {
    if (onClearSearch) {
      onClearSearch?.();
    } else {
      setPage(1);
    }
  };

  async function handleDelete(id: number) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/books/${id}?staffId=${authData.userId}`);
      toast.success('Xóa thành công!');
      eventBus.emit('book:refetch');
      fetchData(currentPage, sortType, filterType, keyword, categoryId, bookId);
    } catch (error) {
      toast.error('Xóa thất bại!');
      console.error('Xóa thất bại:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 bg-white min-w-xl">
      {isSubmitting && <Loader />}
      <div className="flex items-center  justify-between">
        <h1 className="text-lg font-semibold pl-4">{totalItems} Sách</h1>
        {!isComponent && (
          <Link href="/books/new">
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Button>
          </Link>
        )}
      </div>
      <BookSearchBar
        searchType={searchType}
        keyword={keyword}
        categoryId={categoryId}
        onApply={handleSearch}
        onReset={handleClearSearch}
        isSearching={isLoading}
      />

      <BookTable
        data={data}
        total={totalItems}
        loading={isLoading}
        onDelete={handleDelete}
        isComponent={isComponent}
        onPageChange={handlePageChange}
        pageNumbers={pageNumbers}
        currentPage={page}
        totalPages={totalPages}
        onClose={onClose}
        onConfirmSelect={onConfirmSelect}
        selectedData={selectedData}
      />
    </div>
  );
}
