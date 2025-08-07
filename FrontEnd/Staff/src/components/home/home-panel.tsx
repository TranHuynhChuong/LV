'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import {
  Clock,
  Package,
  Percent,
  ShoppingCart,
  Tag,
  TicketPercent,
  Truck,
  TruckIcon,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePanel() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }]);
  }, [setBreadcrumbs]);

  const [data, setData] = useState<null | {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    books: { live: any; hidden: any };
    categories: number;
    promotions: number;
    vouchers: number;
    shipping: number;
    orders: { pending: number; shipping: number; cancelRequest: number };
  }>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const [books, categories, promotions, vouchers, shipping, orders] = await Promise.all([
          api.get('books/total'),
          api.get('categories/total'),
          api.get('promotions/total'),
          api.get('vouchers/total'),
          api.get('shipping/total'),
          api.get('orders/total'),
        ]);
        setData({
          books: books.data,
          categories: categories.data,
          promotions: promotions.data,
          vouchers: vouchers.data,
          shipping: shipping.data,
          orders: orders.data,
        });
      } catch {
        setData(null);
      }
    };
    getData();
  }, []);

  if (!data) return null;

  const totalBooks = data.books;
  const totalCategories = data.categories;
  const totalValidPromotions = data.promotions;
  const totalValidVouchers = data.vouchers;
  const totalShipping = data.shipping;
  const totalOrders = data.orders;

  const overviewItems = [
    {
      icon: <Percent />,
      label: 'Khuyến mãi',
      value: totalValidPromotions,
      href: '/promotions/books?status=active',
      description: 'Đang có hiệu lực',
    },
    {
      icon: <TicketPercent />,
      label: 'Mã giảm giá',
      value: totalValidVouchers,
      href: '/promotions/vouchers?status=active',
      description: 'Đang có hiệu lực',
    },
    {
      icon: <Tag />,
      label: 'Thể loại',
      value: totalCategories,
      href: '/categories',
      description: 'Đã thiết lập',
    },
    {
      icon: <Truck />,
      label: 'Phí vận chuyển',
      value: totalShipping,
      href: '/shipping',
      description: 'Khu vực đã thiết lập',
    },
  ];

  return (
    <div className="p-4 space-y-3">
      <Card className="transition-shadow ">
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-muted">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Đơn hàng</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link href="/orders?type=pending">
              <div className="p-4 transition border rounded-lg cursor-pointer">
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" /> Chờ xác nhận
                </p>
                <p className="text-lg font-semibold ">{totalOrders.pending}</p>
              </div>
            </Link>
            <Link href="/orders?type=shipping">
              <div className="p-4 transition border rounded-lg cursor-pointer">
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <TruckIcon className="w-4 h-4" /> Đang vận chuyển
                </p>
                <p className="text-lg font-semibold">{totalOrders.shipping}</p>
              </div>
            </Link>
            <Link href="/orders?type=cancelRequest">
              <div className="p-4 transition border rounded-lg cursor-pointer">
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <XCircle className="w-4 h-4" /> Yêu cầu hủy
                </p>
                <p className="text-lg font-semibold ">{totalOrders.cancelRequest}</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
      <Card className="transition-shadow ">
        <CardContent className="space-y-4 ">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-muted">
              <Package className="w-6 h-6 " />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Sản phẩm</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="p-4 border rounded-lg ">
              <h3 className="mb-2 text-base font-semibold">Đang hoạt động</h3>
              <div className="flex gap-2">
                <Link
                  className="flex-1 p-4 border rounded-lg"
                  href="/books/list?type=live&status=all"
                >
                  <p className="text-xs text-muted-foreground">Tổng</p>
                  <p className="text-base font-semibold">{totalBooks.live.total}</p>
                </Link>
                <Link
                  className="flex-1 p-4 border rounded-lg"
                  href="/books/list?type=live&status=out&page=1"
                >
                  <p className="text-xs text-muted-foreground">Hết hàng</p>
                  <p className="text-base font-semibold">{totalBooks.live.out}</p>
                </Link>
              </div>
            </div>
            <div className="p-4 border rounded-lg ">
              <h3 className="mb-2 text-base font-semibold">Đã ẩn</h3>
              <div className="flex gap-2">
                <Link
                  className="flex-1 p-4 border rounded-lg"
                  href="/books/list?type=hidden&status=all&page=1"
                >
                  <p className="text-xs text-muted-foreground">Tổng</p>
                  <p className="text-base font-semibold">{totalBooks.hidden.total}</p>
                </Link>
                <Link
                  className="flex-1 p-4 border rounded-lg"
                  href="/books/list?type=hidden&status=out&page=1"
                >
                  <p className="text-xs text-muted-foreground">Hết hàng</p>
                  <p className="text-base font-semibold">{totalBooks.hidden.out}</p>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {overviewItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className="transition-shadow cursor-pointer hover:bg-zinc-50">
              <CardContent className="flex items-center gap-4 ">
                <div className="p-2 rounded-full bg-muted">{item.icon}</div>
                <div>
                  <div>{item.label}</div>
                  <div className="text-xl font-semibold">{item.value}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500">{item.description}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
