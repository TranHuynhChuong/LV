import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AddToCartButton from './AddToCartButton';
import { ProductDetailType } from '@/types/products';

type Props = {
  data: ProductDetailType;
};

export default function ProductBaseInfo({ data }: Readonly<Props>) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  const isOnSale = !!data.salePrice && data.salePrice < data.price;

  return (
    <div className="gap-4">
      <div className="space-y-2 text-sm  rounded-lg bg-white shadow">
        <div className="p-6">
          <h1 className="text-xl font-semibold">{data.name}</h1>

          <div className="w-full grid grid-cols-2 gap-2">
            <p>
              <span className="font-medium">Tác giả:</span> {data.author}
            </p>

            <p>
              <span className="font-medium">NXB:</span> {data.publisher}
            </p>
            <div className="flex items-center gap-2">
              <span className="font-medium">Đánh giá:</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>{data.score.toFixed(1)} / 5</span>
              </div>
            </div>
            <p>
              <span className="font-medium">Đã bán:</span> {data.saled}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-8">
            {isOnSale ? (
              <>
                <span className="text-red-600 text-3xl font-bold">
                  {formatCurrency(data.salePrice)}
                </span>
                <span className="line-through text-gray-400 text-lg">
                  {formatCurrency(data.price)}
                </span>
                <Badge className="bg-red-500 text-white">
                  Giảm {Math.round(((data.price - data.salePrice) / data.price) * 100)}%
                </Badge>
              </>
            ) : (
              <span className="font-bold">{formatCurrency(data.price)}</span>
            )}
          </div>

          {data.stock <= 0 && (
            <div className="bg-zinc-100 rounded-sm px-4 py-2 mt-6">
              <span className="">Hết hàng</span>
            </div>
          )}
        </div>
        <div className="p-4 w-full shadow md:shadow-none md:px-8 md:pb-8">
          <AddToCartButton stock={data.stock} id={data.id} />
        </div>
      </div>
    </div>
  );
}
