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

interface ProductTabProp {
  status: string;
  page: number;
  productId?: string;
  categoryId?: string;
  keyword?: string;
  onSearch?: (param: { type?: 'id' | 'keyword'; keyword?: string; categoryId?: string }) => void;
  onClearSearch?: () => void;
  onPageChange?: (page: number) => void;
  onClose?: () => void;
  selectedData?: ProductSimple[];
  onConfirmSelect?: (selecData: ProductSimple[]) => void;
}

const filterMap: Record<string, number | undefined> = {
  all: undefined,
  live: 1,
  hidden: 2,
};

export default function ProductTab({
  status,
  page,
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
  const [data, setData] = useState<ProductSimple[]>([]);
  const [pagination, setPagination] = useState<number[]>([1]);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const [keyword, setKeyword] = useState<string | undefined>(initialKeyword);
  const [categoryId, setCategoryId] = useState<string | undefined>(initialcategoryId);
  const [productId, setProductId] = useState<string | undefined>(initialProductId);
  const searchType = productId ? 'id' : keyword || categoryId ? 'keyword' : undefined;

  const [isComponent, setIscomponent] = useState<boolean>(false);
  const sortType = undefined;
  const filterType = filterMap[status] ?? undefined;
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
        filterType,
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
    fetchData(page, sortType, filterType, keyword, categoryId, productId);
    if (onPageChange || onSearch || onClearSearch) {
      setIscomponent(false);
    } else {
      setIscomponent(true);
    }
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

  const handleDelete = async (id: number) => {
    if (!id) return;
    api
      .delete(`/products/${id}`)
      .then(() => {
        toast.success('Xóa thành công!');
        fetchData(page, sortType, filterType, keyword, categoryId, productId);
      })
      .catch((error) => {
        toast.error(error.response?.status === 400 ? 'Xóa thất bại!' : 'Đã xảy ra lỗi!');
        console.error('Xóa thất bại:', error);
      });
  };

  return (
    <div className="space-y-4 bg-white min-w-fit">
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
      />
    </div>
  );
}
