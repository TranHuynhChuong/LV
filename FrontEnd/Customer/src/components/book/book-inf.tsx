import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import AddToCartButton from './add-to-cart-button';
import { Book } from '@/models/book';
import Link from 'next/link';
import BookInfDescription from './book-inf-description';

type Props = {
  data: Book;
};

export default function BookInfo({ data }: Readonly<Props>) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  const isOnSale = !!data.purchasePrice && data.purchasePrice < data.sellingPrice;
  const discountedPercent = ((data.sellingPrice - data.purchasePrice) / data.sellingPrice) * 100;
  return (
    <article className="space-y-4" itemScope itemType="http://schema.org/Book">
      <section className="space-y-2 text-sm bg-white rounded-lg shadow">
        <div className="p-6 space-y-4">
          <h1 className="text-2xl font-semibold " itemProp="name">
            {data.title}
          </h1>
          {data.categories?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/search?c=${cat.id}&p=1&s=1`}
                  title={`Xem sách thuộc thể loại ${cat.name}`}
                >
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
              <p className="font-medium">Tác giả:</p>
              <p className="flex-1" itemProp="author">
                {data.author}
              </p>
            </div>
            <div className="flex gap-1">
              <p className="font-medium ">NXB:</p>
              <p className="flex-1" itemProp="publisher">
                {data.publisher}
              </p>
            </div>
            <div className="flex gap-1">
              <p className="font-medium ">Đánh giá:</p>
              <div className="flex items-center flex-1 gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>
                  {data.rating === 0 ? '--' : (data.rating / data.reviewCount).toFixed(1)} / 5
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <p className="font-medium ">Đã bán:</p>
              <p className="flex-1">{data.sold}</p>
            </div>
          </div>
          <div
            className="flex items-center gap-2 mt-8"
            itemProp="offers"
            itemScope
            itemType="http://schema.org/Offer"
          >
            <meta itemProp="priceCurrency" content="VND" />
            {isOnSale ? (
              <>
                <p className="text-3xl font-bold text-red-600" itemProp="price">
                  {formatCurrency(data.purchasePrice)}
                </p>
                <p className="text-lg text-gray-400 line-through">
                  {formatCurrency(data.sellingPrice)}
                </p>
                <Badge className="text-white bg-red-500">
                  Giảm {discountedPercent.toFixed(0)}%
                </Badge>
              </>
            ) : (
              <p className="text-3xl font-bold" itemProp="price">
                {formatCurrency(data.sellingPrice)}
              </p>
            )}
          </div>
          {data.inventory && data.inventory <= 0 && (
            <div className="px-4 py-2 mt-6 rounded-sm bg-zinc-100">
              <span className="">Tạm hết hàng</span>
            </div>
          )}
        </div>
        <div className="w-full shadow md:p-4 md:shadow-none md:px-8 md:pb-8">
          <div className="flex items-center px-6 pb-6 md:hidden">
            <p className="text-sm text-zinc-600">Số lượng {data.inventory} sách có sẵn</p>
          </div>
          <AddToCartButton inventory={data.inventory ?? 0} id={data.bookId} />
        </div>
      </section>
      <section className="p-4 bg-white rounded-md shadow">
        <h2 className="mb-4 text-lg font-semibold">Thông tin chi tiết</h2>
        <div className="flex py-2 text-sm border-b">
          <div className="w-32 text-muted-foreground">Thể loại</div>
          <div className="flex flex-wrap flex-1 gap-1 font-light">
            {data.categories?.length > 0
              ? data.categories.map((cat, index) => (
                  <p key={cat.id} className="flex items-center">
                    <Link
                      href={`/search?c=${cat.id}&p=1&s=1`}
                      className="font-normal underline transition"
                      title={`Xem sách thuộc thể loại ${cat.name}`}
                    >
                      {cat.name}
                    </Link>
                    {index < data.categories.length - 1 && <span>,&nbsp;</span>}
                  </p>
                ))
              : '-'}
          </div>
        </div>
        {[
          ['ISBN', data.isbn, 'isbn'],
          ['Tác giả', data.author, 'author'],
          ['Nhà xuất bản', data.publisher, 'publisher'],
          ['Năm xuất bản', data.publishYear, 'datePublished'],
          ['Ngôn ngữ', data.language, 'inLanguage'],
          ['Người dịch', data.translator, 'translator'],
          ['Số trang', data.page, 'numberOfPages'],
          ['Trọng lượng (gr)', data.weight, null],
          ['Kích thước (cm)', data.size, null],
        ].map(([label, value, itemProp], idx) => (
          <div key={label} className={`flex text-sm py-2 ${idx !== 0 ? 'border-t' : ''}`}>
            <p className="w-32 text-muted-foreground">{label}</p>
            <p className="flex-1 font-light" {...(itemProp ? { itemProp: String(itemProp) } : {})}>
              {value || '—'}
            </p>
          </div>
        ))}
      </section>
      <BookInfDescription
        summary={data.summary ?? ''}
        description={data.description}
        title={data.title}
      />
    </article>
  );
}
