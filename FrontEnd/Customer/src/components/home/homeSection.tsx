import Link from 'next/link';
import { ProductList } from '@/components/product/productList';
import { ProductOverview } from '@/models/products';
import { Button } from '../ui/button';

interface HomeSectionProps {
  title: string;
  products: ProductOverview[];
  showViewMore?: boolean;
  viewMoreLink?: string;
}

export default function HomeSection({
  title,
  products,
  showViewMore = false,
  viewMoreLink = '#',
}: HomeSectionProps) {
  return (
    <section className="bg-white rounded-md p-6 space-y-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <ProductList products={products} displayType="carousel" />
      {showViewMore && viewMoreLink && (
        <div className="w-full flex justify-center">
          <Link href={viewMoreLink}>
            <Button variant="outline" className="text-sm border-zinc-400 cursor-pointer px-12">
              Xem thêm
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}
