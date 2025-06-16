'use client';

import { ProductSimple } from '@/types/products';
import ProductItem from './productItem';

import clsx from 'clsx';
import ProductItemLoading from './productItemLoading';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';

type ProductListProps = {
  products: ProductSimple[];
  displayType?: 'grid' | 'carousel';
  isLoading?: boolean;
  pageSize?: number;
};

export function ProductList({
  products,
  isLoading = false,
  displayType,
  pageSize = 24,
}: Readonly<ProductListProps>) {
  if (displayType === 'carousel') {
    return (
      <Carousel className="w-full">
        <CarouselContent>
          {products.map((product, index) => (
            <CarouselItem key={index} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
              <div className="p-1">
                <ProductItem key={product.id} product={product} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );
  }
  return (
    <div
      className={clsx(
        'grid gap-2',
        'grid-cols-2',
        'sm:grid-cols-3',
        'md:grid-cols-4',
        'lg:grid-cols-5'
      )}
    >
      {isLoading
        ? Array.from({ length: pageSize }).map((_, index) => <ProductItemLoading key={index} />)
        : products.map((product) => <ProductItem key={product.id} product={product} />)}
    </div>
  );
}
