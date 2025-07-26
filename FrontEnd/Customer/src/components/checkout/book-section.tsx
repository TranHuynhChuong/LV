'use client';

import { Cart } from '@/models/cart';
import Image from 'next/image';
import { Badge } from '../ui/badge';

type BooksSectionProps = {
  books: Cart[];
};

export default function BooksSection({ books }: Readonly<BooksSectionProps>) {
  const total = books.reduce((sum, b) => sum + b.discountPrice * b.quantity, 0);

  return (
    <div className="space-y-2">
      <section className="p-6 space-y-4 bg-white border rounded-md shadow">
        {books.length ? (
          <div className="space-y-4">
            {books.map((b) => (
              <div
                key={b.id}
                className="flex items-start gap-4 pt-4 border-t h-18 first:border-none"
              >
                {/* Ảnh sản phẩm */}
                <div className="flex-shrink-0 overflow-hidden border rounded w-14 h-14">
                  <Image
                    src={b.cover}
                    alt={b.name}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex flex-col justify-between flex-1 h-full text-sm">
                  <h4 className="">{b.name}</h4>

                  <div className="flex items-center justify-between w-full">
                    <div className="space-x-2">
                      {b.isOnSale ? (
                        <>
                          <span className="text-red-500">₫{b.discountPrice.toLocaleString()}</span>
                          <span className="text-xs line-through text-zinc-500">
                            ₫{b.salePrice.toLocaleString()}
                          </span>
                          <Badge variant="destructive">{b.discountPercent}%</Badge>
                        </>
                      ) : (
                        <span>₫{b.discountPrice.toLocaleString()}</span>
                      )}
                    </div>

                    <span>x{b.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-4 text-base font-semibold border-t">
              <span>
                Tổng: <span className="text-red-600">{total.toLocaleString()}₫</span>
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-red-500">Chưa có sách được chọn.</p>
        )}
      </section>
    </div>
  );
}
