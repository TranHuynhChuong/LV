import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AddToCartButton from './addToCartButton';
import { ProductDetailType } from '@/types/products';
import { useState } from 'react';
import Link from 'next/link';

type Props = {
  data: ProductDetailType;
};

export default function ProductInfo({ data }: Readonly<Props>) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  const isOnSale = !!data.salePrice && data.salePrice < data.price;

  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-sm  rounded-lg bg-white shadow">
        <div className="p-6 space-y-4">
          <h1 className="text-2xl font-semibold ">{data.name}</h1>

          {data.categories?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.categories.map((cat) => (
                <Link key={cat.id} href={`/search?c=${cat.id}&p=1&s=1`}>
                  <Badge className="bg-zinc-500 text-white hover:bg-zinc-600 transition cursor-pointer">
                    {cat.name}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <span>-</span>
          )}

          <div className="w-full grid grid-cols-2 gap-2">
            <div className="flex gap-1">
              <span className="font-medium  ">Tác giả:</span>
              <p className="flex-1">{data.author}</p>
            </div>

            <div className="flex  gap-1">
              <span className="font-medium ">NXB:</span>
              <p className="flex-1">{data.publisher}</p>
            </div>

            <div className="flex  gap-1">
              <span className="font-medium ">Đánh giá:</span>
              <div className="flex-1 flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>{data.score.toFixed(1)} / 5</span>
              </div>
            </div>

            <div className="flex  gap-1">
              <span className="font-medium ">Đã bán:</span>
              <p className="flex-1">{data.saled}</p>
            </div>
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
              <span className="font-bold text-3xl">{formatCurrency(data.price)}</span>
            )}
          </div>

          {data.stock <= 0 && (
            <div className="bg-zinc-100 rounded-sm px-4 py-2 mt-6">
              <span className="">Hết hàng</span>
            </div>
          )}
        </div>
        <div className="md:p-4 w-full shadow md:shadow-none md:px-8 md:pb-8">
          <div className="flex md:hidden items-center px-6 pb-6">
            <span className="text-sm text-zinc-600">Số lượng {data.stock} sản phẩm có sẵn</span>
          </div>
          <AddToCartButton stock={data.stock} id={data.id} />
        </div>
      </div>
      {/* Chi tiết */}
      <div className="rounded-md shadow bg-white p-4">
        <h2 className="font-semibold mb-4 text-lg">Chi tiết sản phẩm</h2>
        <div className="flex text-sm py-2 border-b">
          <div className="w-32 text-muted-foreground">Thể loại</div>
          <div className="flex-1 font-light flex flex-wrap gap-1">
            {data.categories?.length > 0
              ? data.categories.map((cat, index) => (
                  <span key={cat.id} className="flex items-center">
                    <Link
                      href={`/search?c=${cat.id}&p=1&s=1`}
                      className="underline font-normal transition"
                    >
                      {cat.name}
                    </Link>
                    {index < data.categories.length - 1 && <span>,&nbsp;</span>}
                  </span>
                ))
              : '-'}
          </div>
        </div>
        {[
          ['ISBN', data.isbn],
          ['Tác giả', data.author],
          ['Nhà xuất bản', data.publisher],
          ['Năm xuất bản', data.publishYear],
          ['Ngôn ngữ', data.language],
          ['Người dịch', data.translator],
          ['Số trang', data.page],
          ['Trọng lượng (gr)', data.weight],
        ].map(([label, value], idx) => (
          <div key={label} className={`flex text-sm py-2 ${idx !== 0 ? 'border-t' : ''}`}>
            <div className="w-32 text-muted-foreground">{label}</div>
            <div className="flex-1 font-light">{value || '—'}</div>
          </div>
        ))}
      </div>

      {/* Tóm tắt */}

      <div className="rounded-md shadow bg-white whitespace-pre-line">
        <div
          className={`overflow-hidden p-4 transition-all duration-300 space-y-4 ${
            expanded ? 'h-fit' : 'h-54'
          }`}
        >
          <h2 className="font-semibold text-lg">Mô tả sản phẩm</h2>
          <div>
            <h3 className="font-medium ">Tóm tắt</h3>
            <p className="text-sm text-zinc-700">{data.summary}</p>
          </div>
          <div>
            <h3 className="font-medium ">{data.name}</h3>
            <p className="text-sm text-zinc-700">{data.description}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="rounded-b-md w-full text-sm pb-4 pt-1 text-center relative cursor-pointer"
        >
          {expanded ? 'Rút gọn' : 'Xem thêm'}
          {!expanded && (
            <div className="absolute bottom-full left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none z-0" />
          )}
        </button>
      </div>
    </div>
  );
}
