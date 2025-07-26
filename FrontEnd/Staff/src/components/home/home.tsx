'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
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
import { useBreadcrumb } from '@/contexts/breadcrumb-context';

interface HomePageProps {
  readonly data: {
    products: {
      live: { total: 0; in: 0; out: 0 };
      hidden: { total: 0; in: 0; out: 0 };
    };
    categories: number;
    promotions: number;
    vouchers: number;
    shipping: number;
    orders: {
      pending: 0;
      shipping: 0;
      cancelRequest: 0;
    };
  };
}

export default function HomePage({ data }: HomePageProps) {
  const { products, categories, promotions, vouchers, shipping, orders } = data;

  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }]);
  }, [setBreadcrumbs]);

  const totalProducts = products;
  const totalCategories = categories;
  const totalValidPromotions = promotions;
  const totalValidVouchers = vouchers;
  const totalShipping = shipping;
  const totalOrders = orders;

  const overviewItems = [
    {
      icon: <Percent />,
      label: 'Khuyến mãi',
      value: totalValidPromotions,
      href: '/promotions',
      description: 'Đang có hiệu lực',
    },
    {
      icon: <TicketPercent />,
      label: 'Mã giảm giá',
      value: totalValidVouchers,
      href: '/vouchers',
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
      {/* Đơn hàng */}
      <Card className=" transition-shadow">
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-muted rounded-full">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Đơn hàng</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/orders?status=pending">
              <div className="p-4 border rounded-lg transition cursor-pointer">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Chờ xác nhận
                </p>
                <p className="text-lg font-semibold ">{totalOrders.pending}</p>
              </div>
            </Link>

            <Link href="/orders?status=shipping">
              <div className="p-4 border rounded-lg  transition cursor-pointer">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TruckIcon className="w-4 h-4" /> Đang vận chuyển
                </p>
                <p className="text-lg font-semibold">{totalOrders.shipping}</p>
              </div>
            </Link>

            <Link href="/orders?status=cancelRequest">
              <div className="p-4 border rounded-lg transition cursor-pointer">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Yêu cầu hủy
                </p>
                <p className="text-lg font-semibold ">{totalOrders.cancelRequest}</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className=" transition-shadow">
        <CardContent className=" space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-muted rounded-full">
              <Package className=" w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Sản phẩm</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2  gap-4">
            {/* Sản phẩm đang hiển thị */}
            <div className="p-4 border rounded-lg ">
              <h3 className="text-base font-semibold  mb-2">Đang hoạt động</h3>
              <div className="flex gap-2">
                <Link
                  className="p-4 border flex-1 rounded-lg"
                  href="/products/list/live?status=all"
                >
                  <p className="text-xs text-muted-foreground">Tổng</p>
                  <p className="text-base font-semibold">{totalProducts.live.total}</p>
                </Link>
                <Link
                  className="p-4 border flex-1 rounded-lg"
                  href="/products/list/live?status=out"
                >
                  <p className="text-xs text-muted-foreground">Hết hàng</p>
                  <p className="text-base font-semibold">{totalProducts.live.out}</p>
                </Link>
              </div>
            </div>

            {/* Sản phẩm đã ẩn */}
            <div className="p-4 border rounded-lg ">
              <h3 className="text-base font-semibold  mb-2">Đã ẩn</h3>
              <div className="flex gap-2">
                <Link
                  className="p-4 border flex-1 rounded-lg"
                  href="/products/list/hidden?status=all"
                >
                  <p className="text-xs text-muted-foreground">Tổng</p>
                  <p className="text-base font-semibold">{totalProducts.hidden.total}</p>
                </Link>
                <Link
                  className="p-4 border flex-1 rounded-lg"
                  href="/products/list/hidden?status=out"
                >
                  <p className="text-xs text-muted-foreground">Hết hàng</p>
                  <p className="text-base font-semibold">{totalProducts.hidden.out}</p>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Các mục còn lại */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {overviewItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className="cursor-pointer  hover:bg-zinc-50 transition-shadow">
              <CardContent className=" flex items-center gap-4">
                <div className="p-2 bg-muted rounded-full">{item.icon}</div>
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
