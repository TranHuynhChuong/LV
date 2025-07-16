'use client';

import ProductTable from './productTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import api from '@/lib/axios';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import ProductSearchBar from './productSearchBar';
import Loader from '@/components/utils/Loader';
import { useAuth } from '@/contexts/AuthContext';

import { mapProductsOverviewFromDto, ProductFilterType, ProductOverView } from '@/models/products';
import eventBus from '@/lib/eventBus';

interface ProductTabProp {
  status: string;
  type?: string;
  currentPage: number;
  productId?: string;
  categoryId?: string;
  keyword?: string;
  onSearch?: (param: { type?: 'id' | 'keyword'; keyword?: string; categoryId?: string }) => void;
  onClearSearch?: () => void;
  onPageChange?: (page: number) => void;
  onClose?: () => void;
  selectedData?: ProductOverView[];
  products?: ProductOverView[];
  onConfirmSelect?: (selecData: ProductOverView[]) => void;
}

function buildFilterType(status: string, type: string): ProductFilterType {
  if (status === 'noPromotion') return ProductFilterType.ExcludeActivePromotion;

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

  return `${prefix}-${suffix}` as ProductFilterType;
}

export default function ProductTab({
  status,
  type = 'live',
  currentPage,
  productId: initialProductId = undefined,
  categoryId: initialcategoryId = undefined,
  keyword: initialKeyword = undefined,
  onSearch,
  onClearSearch,
  onPageChange,
  onClose,
  selectedData,
  onConfirmSelect,
}: Readonly<ProductTabProp>) {
  const [data, setData] = useState<ProductOverView[]>([]);
  const [pageNumbers, setPageNumbers] = useState<number[]>([1]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyword, setKeyword] = useState<string | undefined>(initialKeyword);
  const [categoryId, setCategoryId] = useState<string | undefined>(initialcategoryId);
  const [productId, setProductId] = useState<string | undefined>(initialProductId);
  const [page, setPage] = useState<number>(currentPage);
  const searchType = productId ? 'id' : keyword || categoryId ? 'keyword' : undefined;
  const { authData } = useAuth();
  const [isComponent, setIsComponent] = useState<boolean>(false);
  const sortType = undefined;
  const filterType = buildFilterType(status, type);
  const limit = 12;

  const fetchData = useCallback(
    async (
      page: number,
      sortType?: number,
      filterType?: ProductFilterType,
      keyword?: string,
      categoryId?: string,
      productId?: string
    ) => {
      setIsLoading(true);

      if (productId) {
        try {
          const res = await api.get(`products/isbn/${productId}`, {
            params: { filterType: filterType },
          });
          const item = res.data;
          if (!item) throw new Error();
          setData(mapProductsOverviewFromDto([item]));
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

        const url = keyword || categoryId ? '/products/search' : '/products';
        const res = await api.get(url, { params });

        const { data, paginationInfo } = res.data;
        setData(mapProductsOverviewFromDto(data));
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
    [keyword, categoryId, productId, page, status]
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
    fetchData(page, sortType, filterType, keyword, categoryId, productId);
  }, [fetchData]);

  useEffect(() => {
    if (!isComponent) {
      setKeyword(initialKeyword);
      setCategoryId(initialcategoryId);
      setProductId(initialProductId);
    }
  }, [initialKeyword, initialcategoryId, initialProductId, isComponent]);

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
      setProductId(param.keyword);
      setCategoryId(undefined);
      setKeyword(undefined);
    } else if (param.type === 'keyword') {
      setProductId(undefined);
      setCategoryId(param.categoryId);
      setKeyword(param.keyword);
    } else {
      setProductId(undefined);
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
      await api.delete(`/products/${id}?staffId=${authData.userId}`);
      toast.success('Xóa thành công!');
      eventBus.emit('product:refetch');
      fetchData(currentPage, sortType, filterType, keyword, categoryId, productId);
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
        <h1 className="text-lg font-semibold pl-4">{totalItems} Sản phẩm</h1>
        {!isComponent && (
          <Link href="/products/new">
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Button>
          </Link>
        )}
      </div>
      <ProductSearchBar
        searchType={searchType}
        keyword={keyword}
        categoryId={categoryId}
        onApply={handleSearch}
        onReset={handleClearSearch}
        isSearching={isLoading}
      />

      <ProductTable
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
