'use client';

import ProductTable from './productTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import api from '@/lib/axiosClient';
import { ApiProductSimple, ProductSimple } from '@/type/Product';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import ProductSearchBar from './productSearchBar';
import Loader from '@/components/Loader';
import { useAuth } from '@/contexts/AuthContext';

interface ProductTabProp {
  status: string;
  type?: string;
  page: number;
  productId?: string;
  categoryId?: string;
  keyword?: string;
  onSearch?: (param: { type?: 'id' | 'keyword'; keyword?: string; categoryId?: string }) => void;
  onClearSearch?: () => void;
  onPageChange?: (page: number) => void;
  onClose?: () => void;
  selectedData?: ProductSimple[];
  products?: ProductSimple[];
  onConfirmSelect?: (selecData: ProductSimple[]) => void;
}

function buildFilterType(status: string, type: string): number {
  const typeMap: Record<string, number> = {
    all: 3,
    live: 1,
    hidden: 2,
  };

  const statusMap: Record<string, number> = {
    all: 1,
    in: 2,
    out: 3,
  };

  const statusValue = statusMap[status];
  const typeValue = typeMap[type];

  if (status === 'noPromotion') return 0;

  return parseInt(`${typeValue}${statusValue}`);
}

export default function ProductTab({
  status,
  type = 'live',
  page,
  productId: initialProductId = undefined,
  categoryId: initialcategoryId = undefined,
  keyword: initialKeyword = undefined,
  onSearch,
  onClearSearch,
  onPageChange,
  onClose,
  selectedData,
  products,
  onConfirmSelect,
}: Readonly<ProductTabProp>) {
  const [data, setData] = useState<ProductSimple[]>([]);
  const [pagination, setPagination] = useState<number[]>([1]);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyword, setKeyword] = useState<string | undefined>(initialKeyword);
  const [categoryId, setCategoryId] = useState<string | undefined>(initialcategoryId);
  const [productId, setProductId] = useState<string | undefined>(initialProductId);
  const searchType = productId ? 'id' : keyword || categoryId ? 'keyword' : undefined;
  const { authData } = useAuth();
  const [isComponent, setIscomponent] = useState<boolean>(false);
  const sortType = undefined;
  const filterType = buildFilterType(status, type);
  const limit = 24;

  const fetchData = useCallback(
    async (
      page: number,
      sortType?: number,
      filterType?: number,
      keyword?: string,
      categoryId?: string,
      productId?: string
    ) => {
      setIsLoading(true);

      const mapProducts = (data: ApiProductSimple[]): ProductSimple[] =>
        data.map((item) => ({
          id: item.SP_id,
          name: item.SP_ten,
          price: item.SP_giaBan,
          stock: item.SP_tonKho,
          cost: item.SP_giaNhap,
          sold: item.SP_daBan,
          image: item.SP_anh,
          status: item.SP_trangThai,
        }));

      if (productId) {
        const idNumber = Number(productId);
        if (Number.isNaN(idNumber)) {
          setData([]);
          setPagination([1]);
          setTotalPage(1);
          setTotalItems(0);
          setIsLoading(false);
          return;
        }

        api
          .get(`products/${productId}`, { params: { mode: 'search' } })
          .then((res) => {
            const item = res.data.product;
            const mapped: ProductSimple = {
              id: item.SP_id,
              name: item.SP_ten,
              price: item.SP_giaBan,
              stock: item.SP_tonKho,
              cost: item.SP_giaNhap,
              sold: item.SP_daBan,
              image: item.SP_anh,
              status: item.SP_trangThai,
            };
            setData([mapped]);
            setPagination([]);
            setTotalPage(1);
            setTotalItems(1);
          })
          .catch(() => {
            setData([]);
            setPagination([1]);
            setTotalPage(1);
            setTotalItems(0);
          })
          .finally(() => setIsLoading(false));

        return;
      }

      const params = {
        page,
        sortType,
        filterType: isComponent ? 0 : filterType,
        limit,
        keyword,
        categoryId,
      };

      const url = keyword || categoryId ? '/products/search' : '/products';

      api
        .get(url, { params })
        .then((res) => {
          const { data, metadata } = res.data;
          setData(mapProducts(data));
          setPagination(metadata.pagination);
          setTotalPage(metadata.totalPage);
          setTotalItems(metadata.totalItems);
        })
        .catch(() => {
          setData([]);
          setPagination([1]);
          setTotalPage(1);
          setTotalItems(0);
        })
        .finally(() => setIsLoading(false));
    },
    [sortType, filterType, limit]
  );

  useEffect(() => {
    if (onPageChange && onSearch && onClearSearch) {
      setIscomponent(false);
    } else {
      setIscomponent(true);
    }
    fetchData(page, sortType, filterType, keyword, categoryId, productId);
  }, [status, page, keyword, categoryId, productId, fetchData]);

  useEffect(() => {
    if (!isComponent) {
      setKeyword(initialKeyword);
      setCategoryId(initialcategoryId);
      setProductId(initialProductId);
    }
  }, [initialKeyword, initialcategoryId, initialProductId, isComponent]);

  const handlePageChange = (targetPage: number) => {
    if (targetPage !== page) {
      if (onPageChange) {
        onPageChange?.(targetPage);
      } else {
        fetchData(page, sortType, filterType, keyword, categoryId, productId);
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
    } else {
      if (param.type === 'id') {
        setProductId(keyword);
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
    }
  };

  const handleClearSearch = () => {
    if (onClearSearch) {
      onClearSearch?.();
    } else {
      fetchData(1, sortType, filterType);
    }
  };

  const handleDelete = (id: number) => {
    if (!id) return;
    setIsSubmitting(true);
    api
      .delete(`/products/${id}?staffId=${authData.userId}`)
      .then(() => {
        toast.success('Xóa thành công!');
        fetchData(page, sortType, filterType, keyword, categoryId, productId);
      })
      .catch((error) => {
        toast.error(error.response?.status === 400 ? 'Xóa thất bại!' : 'Đã xảy ra lỗi!');
        console.error('Xóa thất bại:', error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="space-y-4 bg-white min-w-fit">
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
        pagination={pagination}
        page={page}
        totalPage={totalPage}
        onClose={onClose}
        onConfirmSelect={onConfirmSelect}
        selectedData={selectedData}
        products={products}
      />
    </div>
  );
}
