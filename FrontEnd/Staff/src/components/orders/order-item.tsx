'use client';

import eventBus from '@/lib/event-bus';
import { OrderOverview } from '@/models/orders';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Badge } from '../ui/badge';
import OrderActions from './order-actions';

export const statusMap: Record<string, string> = {
  ChoXacNhan: 'Chờ xác nhận',
  ChoVanChuyen: 'Chờ vận chuyển',
  DangVanChuyen: 'Đang vận chuyển',
  GiaoThanhCong: 'Giao thành công',
  GiaoThatBai: 'Giao thất bại',
  YeuCauHuy: 'Yêu cầu hủy',
  DaHuy: 'Đã hủy',
};

export default function OrderItem({ order }: Readonly<{ order: OrderOverview }>) {
  const [expanded, setExpanded] = useState(false);
  const displayedBooks = expanded ? order.orderDetails : order.orderDetails.slice(0, 1);
  const total =
    order.orderDetails.reduce((sum, p) => sum + p.priceBuy * p.quantity, 0) -
    order.discountInvoice -
    order.discountShipping +
    order.shippingFee;

  return (
    <div className="bg-white border rounded-md ">
      <div className="px-4">
        <div className="flex items-start justify-between gap-4 py-4">
          <div className="flex flex-col gap-2 text-sm ">
            <p className="font-medium whitespace-nowrap">Mã đơn: {order.orderId}</p>
            <p>{format(new Date(order.createdAt), 'dd/MM/yyyy')}</p>
          </div>
          <div className="flex flex-col items-end gap-2 text-sm">
            <span className="whitespace-nowrap">{statusMap[order.status] || 'Không xác định'}</span>
            {order.requestInvoice && (
              <Badge variant="outline" className="whitespace-nowrap">
                Yêu cầu xuất hóa đơn
              </Badge>
            )}
          </div>
        </div>
        <div className="text-sm divide-y">
          <AnimatePresence initial={false}>
            {displayedBooks.map((item) => (
              <motion.div
                key={item.bookId}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 py-2">
                  <Image
                    src={item.bookImage}
                    alt={item.bookName}
                    width={56}
                    height={56}
                    priority
                    className="object-cover border rounded-md"
                  />
                  <div className="flex flex-col justify-between flex-1 h-14">
                    <div className="flex justify-between ">
                      <div className=" line-clamp-2">{item.bookName}</div>
                      <div className="text-sm text-muted-foreground">x {item.quantity}</div>
                    </div>
                    <div className="flex items-end justify-end gap-1">
                      {item.priceSell !== item.priceBuy ? (
                        <>
                          <span className="text-xs line-through text-muted-foreground">
                            {new Intl.NumberFormat('vi-VN').format(item.priceSell)} đ
                          </span>
                          <span className="text-sm font-medium">
                            {new Intl.NumberFormat('vi-VN').format(item.priceBuy)} đ
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-medium">
                          {new Intl.NumberFormat('vi-VN').format(item.priceBuy)} đ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {order.orderDetails.length > 1 && (
          <button
            className="flex items-center justify-center w-full gap-1 text-xs cursor-pointer text-muted-foreground hover:underline"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Ẩn bớt' : `Xem thêm`}
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${
                expanded ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </button>
        )}
        <div className="py-4 space-y-6 ">
          <div className="flex items-end justify-end gap-1 text-xs text-muted-foreground">
            Tổng tiền số tiền ({order.orderDetails.length} sản phẩm):
            <span className="text-sm font-semibold text-primary">
              {new Intl.NumberFormat('vi-VN').format(total)} đ
            </span>
          </div>
          <OrderActions
            id={order.orderId}
            status={order.status}
            onSuccess={() => eventBus.emit('order:refetch')}
          />
        </div>
      </div>
    </div>
  );
}
