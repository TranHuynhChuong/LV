'use client';

import { statusMap } from './orderItem';
import { MapPin } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Order } from '@/models/orders';
import OrderActions from './orderActions';

interface OrderDetailProps {
  data: Order;
}

export default function OrderDetail({ data }: Readonly<OrderDetailProps>) {
  const {
    orderId,
    createdAt,
    status,
    customerEmail,
    shippingInfo,
    orderDetails,
    activityLogs,
    discountInvoice,
    discountShipping,
    shippingFee,
    reviewed,
  } = data;

  const total =
    orderDetails.reduce((sum, p) => sum + p.priceBuy * p.quantity, 0) -
    discountInvoice -
    discountShipping +
    shippingFee;
  const router = useRouter();
  return (
    <div className="space-y-2">
      <div className="flex items-center h-20 p-6 font-medium bg-white border rounded-md">
        Mã đơn hàng: {orderId} | {statusMap[status] || 'Không xác định'}
      </div>

      <div className="flex flex-col p-6 bg-white border rounded-md md:flex-row">
        <div className="flex-1">
          <h3 className="font-medium">Thông tin giao hàng</h3>
          <div className="flex gap-1 pt-2 pl-2 text-sm font-normal">
            <MapPin size={16} className="mt-1 text-muted-foreground" />
            <div className="space-y-2">
              <p>
                {shippingInfo.recipientName}
                <span className="ml-2 text-muted-foreground">| {shippingInfo.phoneNumber}</span>
              </p>
              <div>
                <p className=" text-muted-foreground">
                  {`${shippingInfo.addressInfo.ward.name}, ${shippingInfo.addressInfo.province.name}`}
                </p>
                <p className=" text-muted-foreground">{shippingInfo.note}</p>
              </div>
              <p className=" text-muted-foreground">Email: {customerEmail}</p>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col flex-1 pl-6 mt-8 text-sm border-gray-300">
          {[{ time: createdAt, action: 'Đặt hàng thành công' }, ...activityLogs].map(
            (item, index, arr) => {
              const isLast = index === arr.length - 1;
              return (
                <div key={index} className="relative mb-3">
                  {/* Chấm tròn */}
                  <div
                    className={`
            absolute -left-4 top-1.5 w-3 h-3 rounded-full
            ${isLast ? 'bg-primary' : 'bg-zinc-300'}
            ring-2 ring-white
          `}
                  />

                  {/* Nếu không phải cuối thì có line kèm theo */}
                  {!isLast && (
                    <div className="absolute w-[1px] h-10 bg-gray-300 -left-[11px] top-4"></div>
                  )}

                  {/* Nội dung */}
                  <div className="ml-2">
                    <p className="text-muted-foreground">{new Date(item.time).toLocaleString()}</p>
                    <p>{item.action}</p>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      <div className="p-6 space-y-4 bg-white border rounded-md">
        <div className="font-medium">Danh sách sản phẩm</div>
        <div className="text-sm divide-y">
          <AnimatePresence initial={false}>
            {orderDetails.map((item) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 py-2">
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    width={56}
                    height={56}
                    priority
                    className="object-cover border rounded-md"
                  />
                  <div className="flex flex-col justify-between flex-1 h-14">
                    <div className="flex justify-between ">
                      <div className="line-clamp-2 ">{item.productName}</div>
                      <div className="flex-shrink-0 text-sm text-muted-foreground">
                        x {item.quantity}
                      </div>
                    </div>
                    <div className="flex items-end justify-end gap-1">
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
        <div className="pt-2 space-y-2 text-sm border-t">
          <div className="flex justify-between">
            <span className="text-gray-600">Tiền hàng</span>
            <span>
              {orderDetails.reduce((sum, p) => sum + p.priceBuy * p.quantity, 0).toLocaleString()} đ
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Phí vận chuyển</span>
            <span>{shippingFee.toLocaleString()} đ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Giảm hóa đơn</span>
            <span>-{discountInvoice.toLocaleString()} đ</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Giảm phí vận chuyển</span>
            <span>-{discountShipping.toLocaleString()} đ</span>
          </div>

          <div className="flex justify-between pt-2 font-semibold border-t text-primary">
            <span>Tổng thanh toán</span>
            <span>{total.toLocaleString()} đ</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end flex-1 w-full gap-2 p-6 bg-white border rounded-md">
        <Button
          variant="outline"
          className="text-sm font-normal cursor-pointer"
          onClick={() => router.back()}
        >
          Thoát
        </Button>

        <OrderActions
          showView={false}
          reviewed={reviewed}
          id={orderId}
          status={status}
          onSuccess={() => {
            router.back();
          }}
        />
      </div>
    </div>
  );
}
