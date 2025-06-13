'use client';

import { ProductSimple } from '@/types/products';
import ProductItem from './productItem';

import clsx from 'clsx';
import ProductItemLoading from './productItemLoading';

type ProductListProps = {
  products: ProductSimple[];
  displayType?: 'grid' | 'carousel';
  isLoading?: boolean;
  pageSize?: number;
};

export function ProductList({
  products,
  isLoading = false,
  pageSize = 24,
}: Readonly<ProductListProps>) {
  return (
    <div className={clsx('grid gap-2', 'grid-cols-2', 'sm:grid-cols-4', 'lg:grid-cols-6')}>
      {isLoading
        ? Array.from({ length: pageSize }).map((_, index) => <ProductItemLoading key={index} />)
        : products.map((product) => <ProductItem key={product.id} product={product} />)}
    </div>
  );
}
