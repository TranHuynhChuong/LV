'use client';

import { Cart } from '@/models/carts';
import Image from 'next/image';
import { Badge } from '../ui/badge';

interface OrderPageProps {
  readonly products: Cart[];
}

export default function ProductsOrderSection({ products }: OrderPageProps) {
  const total = products.reduce((sum, p) => sum + p.discountPrice * p.quantity, 0);

  return (
    <div className="space-y-2">
      <section className="p-6 bg-white border rounded-md shadow space-y-4">
        <h2 className="font-semibold text-base">Sản phẩm</h2>

        {products.length ? (
          <div className="space-y-4">
            {products.map((p) => (
              <div
                key={p.productId}
                className="flex items-start gap-4 h-18 border-t pt-4 first:border-none"
              >
                {/* Ảnh sản phẩm */}
                <div className="w-14 h-14 flex-shrink-0 rounded overflow-hidden border">
                  <Image
                    src={p.cover}
                    alt={p.name}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Thông tin sản phẩm */}
                <div className="flex-1 flex flex-col justify-between h-full text-sm">
                  <h4 className="">{p.name}</h4>

                  <div className="flex w-full justify-between items-center">
                    <div className="space-x-2">
                      {p.isOnSale ? (
                        <>
                          <span className="text-red-500">₫{p.discountPrice.toLocaleString()}</span>
                          <span className="line-through text-zinc-500 text-xs">
                            ₫{p.salePrice.toLocaleString()}
                          </span>
                          <Badge variant="destructive">{p.discountPercent}%</Badge>
                        </>
                      ) : (
                        <span>₫{p.discountPrice.toLocaleString()}</span>
                      )}
                    </div>

                    <span>x{p.quantity}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Tổng cộng */}
            <div className="flex justify-end border-t pt-4 text-base font-semibold">
              <span>
                Tổng: <span className="text-red-600">{total.toLocaleString()}₫</span>
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-red-500">Chưa có sản phẩm nào.</p>
        )}
      </section>
    </div>
  );
}
