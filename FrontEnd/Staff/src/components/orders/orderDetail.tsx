'use client';

import { Order } from '@/types/Order';
import { statusMap } from './orderItem';
import { MapPin } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface OrderDetailProps {
  data: Order;
}

export default function OrderDetail({ data }: OrderDetailProps) {
  const {
    orderId,
    createdAt,
    status,
    customerEmail,
    shippingInfo,
    orderDetails,
    history,
    discountInvoice,
    discountShipping,
    shippingFee,
  } = data;

  const total =
    orderDetails.reduce((sum, p) => sum + p.priceBuy * p.quantity, 0) -
    discountInvoice -
    discountShipping +
    shippingFee;
  const router = useRouter();
  return (
    <div className="space-y-2">
      <div className="p-6 bg-white rounded-md border h-20 font-medium flex items-center">
        Mã đơn hàng: {orderId} | {statusMap[status] || 'Không xác định'}
      </div>

      <div className="p-6 bg-white rounded-md border flex">
        <div className="flex-1">
          <h3 className="font-medium">Thông tin giao hàng</h3>
          <div className="flex gap-1 text-sm font-normal pt-2 pl-2">
            <MapPin size={16} className="mt-1 text-muted-foreground" />
            <div>
              <p>
                {shippingInfo.recipientName}
                <span className=" text-muted-foreground ml-2">| {shippingInfo.phoneNumber}</span>
              </p>
              <p className=" text-muted-foreground">
                {`${shippingInfo.addressInfo.ward.name}, ${shippingInfo.addressInfo.province.name}`}
              </p>
              <p className=" text-muted-foreground">{shippingInfo.note}</p>
              <p className=" text-muted-foreground">Email: {customerEmail}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 text-sm">
          <div className="flex flex-1 gap-4">
            <p>{new Date(createdAt).toLocaleString()}</p>
            <p>Đặt hàng thành công</p>
          </div>
          {history.map((h, index) => (
            <div key={index} className="flex flex-1 gap-4">
              <p> {new Date(h.time).toLocaleString()}</p>
              <p>{h.action}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-6 bg-white rounded-md border">
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
        <div className="space-y-2 text-sm border-t pt-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Tiền hàng</span>
            <span className="font-medium">
              {orderDetails.reduce((sum, p) => sum + p.priceBuy * p.quantity, 0).toLocaleString()} đ
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Phí vận chuyển</span>
            <span className="font-medium">{shippingFee.toLocaleString()} đ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Giảm hóa đơn</span>
            <span className="font-medium text-red-500">-{discountInvoice.toLocaleString()} đ</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Giảm phí vận chuyển</span>
            <span className="font-medium text-red-500">-{discountShipping.toLocaleString()} đ</span>
          </div>

          <div className="flex justify-between border-t pt-2 font-semibold text-primary">
            <span>Tổng thanh toán</span>
            <span>{total.toLocaleString()} đ</span>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-md border flex gap-2 flex-wrap w-full justify-end flex-1">
        <Button
          variant="outline"
          className="font-normal flex-1 text-sm cursor-pointer"
          onClick={() => router.back()}
        >
          Thoát
        </Button>
        <Button variant="outline" className="font-normal flex-1 text-sm cursor-pointer">
          Xuất phiếu giao hàng
        </Button>
        {[1, 2, 6].includes(status) && (
          <Button
            variant="outline"
            className="font-normal flex-1  text-sm  cursor-pointer border-red-600/30 text-red-600/80 hover:text-red-600/90"
          >
            Hủy đơn
          </Button>
        )}

        {[1, 2, 3].includes(status) && (
          <Button variant="outline" className="font-normal flex-1/3 text-sm cursor-pointer">
            Xác nhận
          </Button>
        )}
      </div>
    </div>
  );
}
