import { Card, CardContent } from '@/components/ui/card';
import { ProductSimple } from '@/types/products'; // đường dẫn đúng với dự án của bạn
import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductItemProps {
  product: ProductSimple;
}

export default function ProductItem({ product }: Readonly<ProductItemProps>) {
  const { name, price, selePrice, image, sold, score, discountPercent, id } = product;

  return (
    <Link href={`/product/${id}`}>
      <Card className="hover:shadow-[0_0_10px_rgba(0,0,0,0.2)] hover:z-10 transition-shadow duration-300 relative shadow-none rounded-sm overflow-hidden py-4 gap-2 h-full w-full flex flex-col cursor-pointer">
        <div className="">
          <div className=" relative h-42 inset-0 flex justify-center items-center">
            <Image src={image} alt={name} fill className="object-contain  w-auto h-full " />
          </div>
        </div>

        {discountPercent && (
          <span className="absolute top-0 right-0 bg-red-500 p-1 text-white text-xs rounded-bl-md">
            -{discountPercent}%
          </span>
        )}

        <CardContent className="px-4 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="text-sm  line-clamp-2 h-[3em]">{name}</h3>
            <div className="mt-1 flex flex-wrap items-center space-x-2">
              {selePrice !== undefined ? (
                <>
                  <span className="text-base font-bold text-red-600">
                    {selePrice.toLocaleString()}₫
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    {price.toLocaleString()}₫
                  </span>
                </>
              ) : (
                <>
                  <span className="text-base font-bold text-gray-800">
                    {price.toLocaleString()}₫
                  </span>
                  <span className="text-xs text-transparent line-through">
                    {price.toLocaleString()}₫
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Star size={12} className=" text-yellow-500 fill-yellow-500" />
              <span className="mt-0.5">{score.toFixed(1)}</span>
            </div>
            <span>Đã bán {sold}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
