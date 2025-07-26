import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import AddToCartButton from './add-to-cart-button';
import { BookDetail } from '@/models/book';
import Link from 'next/link';
import { useState } from 'react';

type Props = {
  data: BookDetail;
};

export default function BookInfo({ data }: Readonly<Props>) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  const isOnSale = !!data.discountPrice && data.discountPrice < data.salePrice;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-sm bg-white rounded-lg shadow">
        <div className="p-6 space-y-4">
          <h1 className="text-2xl font-semibold ">{data.name}</h1>
          {data.categories?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.categories.map((cat) => (
                <Link key={cat.id} href={`/search?c=${cat.id}&p=1&s=1`}>
                  <Badge className="text-white transition cursor-pointer bg-zinc-500 hover:bg-zinc-600">
                    {cat.name}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <span>-</span>
          )}
          <div className="grid w-full grid-cols-2 gap-2">
            <div className="flex gap-1">
              <span className="font-medium ">Tác giả:</span>
              <p className="flex-1">{data.author}</p>
            </div>
            <div className="flex gap-1">
              <span className="font-medium ">NXB:</span>
              <p className="flex-1">{data.publisher}</p>
            </div>
            <div className="flex gap-1">
              <span className="font-medium ">Đánh giá:</span>
              <div className="flex items-center flex-1 gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>{data.rating === 0 ? '--' : data.rating.toFixed(1)} / 5</span>
              </div>
            </div>
            <div className="flex gap-1">
              <span className="font-medium ">Đã bán:</span>
              <p className="flex-1">{data.saled}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-8">
            {isOnSale ? (
              <>
                <span className="text-3xl font-bold text-red-600">
                  {formatCurrency(data.discountPrice)}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  {formatCurrency(data.salePrice)}
                </span>
                <Badge className="text-white bg-red-500">Giảm {data.discountPercent}%</Badge>
              </>
            ) : (
              <span className="text-3xl font-bold">{formatCurrency(data.salePrice)}</span>
            )}
          </div>
          {data.inventory <= 0 && (
            <div className="px-4 py-2 mt-6 rounded-sm bg-zinc-100">
              <span className="">Tạm hết hàng</span>
            </div>
          )}
        </div>
        <div className="w-full shadow md:p-4 md:shadow-none md:px-8 md:pb-8">
          <div className="flex items-center px-6 pb-6 md:hidden">
            <span className="text-sm text-zinc-600">Số lượng {data.inventory} sách có sẵn</span>
          </div>
          <AddToCartButton inventory={data.inventory} id={data.id} />
        </div>
      </div>
      <div className="p-4 bg-white rounded-md shadow">
        <h2 className="mb-4 text-lg font-semibold">Thông tin chi tiết</h2>
        <div className="flex py-2 text-sm border-b">
          <div className="w-32 text-muted-foreground">Thể loại</div>
          <div className="flex flex-wrap flex-1 gap-1 font-light">
            {data.categories?.length > 0
              ? data.categories.map((cat, index) => (
                  <span key={cat.id} className="flex items-center">
                    <Link
                      href={`/search?c=${cat.id}&p=1&s=1`}
                      className="font-normal underline transition"
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
          ['Kích thước (cm)', data.size],
        ].map(([label, value], idx) => (
          <div key={label} className={`flex text-sm py-2 ${idx !== 0 ? 'border-t' : ''}`}>
            <div className="w-32 text-muted-foreground">{label}</div>
            <div className="flex-1 font-light">{value || '—'}</div>
          </div>
        ))}
      </div>
      <div className="whitespace-pre-line bg-white rounded-md shadow">
        <div
          className={`overflow-hidden p-4 transition-all duration-300 space-y-4 ${
            expanded ? 'h-fit' : 'h-54'
          }`}
        >
          <h2 className="text-lg font-semibold">Thông tin mô tả</h2>
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
          className="relative w-full pt-1 pb-4 text-sm text-center cursor-pointer rounded-b-md"
        >
          {expanded ? 'Rút gọn' : 'Xem thêm'}
          {!expanded && (
            <div className="absolute left-0 right-0 z-0 h-12 pointer-events-none bottom-full bg-gradient-to-t from-white to-transparent" />
          )}
        </button>
      </div>
    </div>
  );
}
