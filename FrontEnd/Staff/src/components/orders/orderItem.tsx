import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order } from '@/types/Order';

export const statusMap: Record<number, string> = {
  0: 'Tất cả',
  1: 'Chờ xác nhận',
  2: 'Chờ vận chuyển',
  3: 'Đang vận chuyển',
  4: 'Giao thành công',
  5: 'Giao thất bại',
  6: 'Yêu cầu hủy',
  7: 'Đã hủy',
};

export default function OrderItem({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  const displayedProducts = expanded ? order.orderDetails : order.orderDetails.slice(0, 1);

  const total =
    order.orderDetails.reduce((sum, p) => sum + p.priceBuy * p.quantity, 0) -
    order.discountInvoice -
    order.discountShipping +
    order.shippingFee;

  return (
    <div className=" rounded-md bg-white border">
      <div className="px-4">
        {/* Tiêu đề */}
        <div className="flex justify-between items-center py-4 gap-4">
          <div className="font-medium text-sm whitespace-nowrap">Mã đơn: {order.orderId}</div>
          <span className="text-sm whitespace-nowrap">
            {statusMap[order.status] || 'Không xác định'}
          </span>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="text-sm divide-y">
          <AnimatePresence initial={false}>
            {displayedProducts.map((item) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 items-center py-2">
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    width={56}
                    height={56}
                    priority
                    className="rounded-md object-cover border"
                  />
                  <div className="flex-1 flex flex-col justify-between h-14">
                    <div className="flex justify-between ">
                      <div className="line-clamp-2 ">{item.productName}</div>
                      <div className="text-sm text-muted-foreground flex-shrink-0">
                        x {item.quantity}
                      </div>
                    </div>
                    <div className="flex justify-end gap-1 items-end">
                      {item.priceSell !== item.priceBuy ? (
                        <>
                          <span className="text-xs line-through text-muted-foreground">
                            {item.priceSell.toLocaleString()} đ
                          </span>
                          <span className="text-sm font-medium">
                            {item.priceBuy.toLocaleString()} đ
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-medium">
                          {item.priceBuy.toLocaleString()} đ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Nút xem thêm/ẩn bớt */}
        {order.orderDetails.length > 1 && (
          <button
            className="text-xs w-full flex items-center gap-1 justify-center text-muted-foreground hover:underline cursor-pointer"
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

        {/* Tổng tiền và hành động */}
        <div className="py-4 space-y-6 ">
          <div className="text-xs text-muted-foreground flex justify-end gap-1 items-end">
            Tổng tiền số tiền ({order.orderDetails.length} sản phẩm):
            <span className="text-sm font-semibold text-primary"> {total.toLocaleString()} đ</span>
          </div>
          <div className="flex gap-2 flex-wrap w-full justify-end ">
            {[1, 2, 6].includes(order.status) && (
              <Button
                variant="outline"
                className="font-normal text-sm border-red-600/30 text-red-600/80 hover:text-red-600/90 cursor-pointer"
              >
                Hủy đơn
              </Button>
            )}

            {[1, 2, 3].includes(order.status) && (
              <Button variant="outline" className="font-normal text-sm cursor-pointer">
                Xác nhận
              </Button>
            )}

            <Link href={`/orders/${order.orderId}`}>
              <Button variant="outline" className="font-normal text-sm cursor-pointer">
                Xem chi tiết
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
