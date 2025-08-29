'use client';

import { Cart } from '@/models/cart';
import Image from 'next/image';
import { Badge } from '../ui/badge';

type BooksSectionProps = {
  books: Cart[];
};

export default function BooksSection({ books }: Readonly<BooksSectionProps>) {
  const total = books.reduce((sum, b) => sum + b.purchasePrice * b.quantity, 0);

  return (
    <div className="space-y-2">
      <section className="p-6 space-y-4 bg-white border rounded-md shadow">
        {books.length ? (
          <div className="space-y-4">
            {books.map((b) => (
              <div
                key={b.bookId}
                className="flex items-start gap-4 pt-4 border-t h-18 first:border-none"
              >
                {/* Ảnh sản phẩm */}
                <div className="flex-shrink-0 overflow-hidden border rounded w-14 h-14">
                  <Image
                    src={b.image}
                    alt={b.title}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex flex-col justify-between flex-1 h-full text-sm">
                  <h4 className="">{b.title}</h4>

                  <div className="flex items-center justify-between w-full">
                    <div className="space-x-2">
                      {b.purchasePrice < b.sellingPrice ? (
                        <>
                          <span className="text-red-500">₫{b.purchasePrice.toLocaleString()}</span>
                          <span className="text-xs line-through text-zinc-500">
                            ₫{b.sellingPrice.toLocaleString()}
                          </span>
                          <Badge variant="destructive">
                            {(((b.sellingPrice - b.purchasePrice) / b.sellingPrice) * 100).toFixed(
                              0
                            )}
                            %
                          </Badge>
                        </>
                      ) : (
                        <span>₫{b.purchasePrice.toLocaleString()}</span>
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
