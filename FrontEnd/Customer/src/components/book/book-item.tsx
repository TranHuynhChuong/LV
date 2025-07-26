import { Card, CardContent } from '@/components/ui/card';
import { BookOverview } from '@/models/book';
import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type BookItemProps = {
  book: BookOverview;
};

export default function BookItem({ book }: Readonly<BookItemProps>) {
  const { name, salePrice, isOnSale, discountPrice, image, sold, rating, discountPercent, id } =
    book;

  return (
    <Link href={`/book/${id}`}>
      <Card className="hover:shadow-[0_0_10px_rgba(0,0,0,0.2)] hover:z-10 transition-shadow duration-300 relative shadow-none rounded-sm overflow-hidden py-4 gap-2 h-full w-full flex flex-col cursor-pointer">
        <div className="">
          <div className="relative inset-0 flex items-center justify-center h-42">
            <Image src={image} alt={name} fill priority className="object-contain w-auto h-full " />
          </div>
        </div>

        {isOnSale && (
          <span className="absolute top-0 right-0 p-1 text-xs text-white bg-red-500 rounded-bl-md">
            -{discountPercent}%
          </span>
        )}

        <CardContent className="flex flex-col justify-between flex-1 px-4">
          <div>
            <h3 className="text-sm  line-clamp-2 h-[3em]">{name}</h3>
            <div className="flex flex-wrap items-center mt-1 space-x-2">
              {isOnSale ? (
                <>
                  <span className="text-base font-bold text-red-600">
                    {discountPrice.toLocaleString()}₫
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    {salePrice.toLocaleString()}₫
                  </span>
                </>
              ) : (
                <span className="text-base font-bold text-gray-800">
                  {salePrice.toLocaleString()}₫
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Star size={12} className="text-yellow-500 fill-yellow-500" />
              <span className="mt-0.5">{rating === 0 ? '--' : rating.toFixed(1)}</span>
            </div>
            <span>Đã bán {sold}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
