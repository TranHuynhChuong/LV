'use client';

import BooksSection from '@/components/checkout/book-section';
import AddressForm, { AddressFormHandle } from '@/components/profile/address/address-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import Loader from '@/components/utils/loader';
import OverLay from '@/components/utils/overLay';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/axios-client';
import { emitCartChange } from '@/lib/cart-events';
import { Address, mapAddressListFromDto, mapAddressToDto } from '@/models/address';
import { Cart } from '@/models/cart';
import { Voucher } from '@/models/voucher';
import { useCartStore } from '@/stores/cart.store';
import { useOrderStore } from '@/stores/orderStore';
import clsx from 'clsx';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  formatCurrency,
  mapShippingPolicyFromApi,
  mapToDataCheck,
  ShippingPolicy,
  useOrderSummary,
} from './checkout-utils';
import type { InvoiceFormHandle } from '@/components/checkout/invoice-section';
import InvoiceForm from '@/components/checkout/invoice-section';
import PaymentMethod from './payment-methods';
import OrderErrorDialog from './order-error-dialog';
import OrderSuccessDialog from './order-success-dialog';
import VoucherSection from './voucher-section';
import AddressList from '../profile/address/address-list';

export default function CheckOutPanel() {
  const [address, setAddress] = useState<Address>();
  const [selectedVouchers, setSelectedVouchers] = useState<Voucher[]>([]);
  const [openSelectAddress, setOpenSelectAddress] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const invoiceRef = useRef<InvoiceFormHandle>(null);
  const addressRef = useRef<AddressFormHandle>(null);
  const router = useRouter();
  const { authData } = useAuth();
  const orders = useOrderStore((state) => state.orders);
  const clearOrder = useOrderStore((state) => state.clearOrder);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [shippingPolicy, setShippingPolicy] = useState<ShippingPolicy>();
  const [books, setBooks] = useState<Cart[]>([]);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestEmailErr, setGuestEmailErr] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { orderTotal, shippingFee, productDiscount, shippingDiscount, total, totalSaving } =
    useOrderSummary(books, shippingPolicy, selectedVouchers);
  const [createSuccess, setCreateSuccess] = useState(false);
  const removeFromCartByIds = useCartStore((state) => state.removeFromCartByIds);
  const [paymentMethod, setPaymentMethod] = useState<string>('COD');

  const getDefaultAddress = useCallback(
    async (userId: number) => {
      try {
        const res = await api.get(`addresses/${userId}`);
        const mapped = await mapAddressListFromDto(res.data);
        const defaultAddress = mapped.find((a) => a.default);
        setAddress(defaultAddress);
      } catch {
        router.back();
      }
    },
    [router]
  );

  useEffect(() => {
    if (!authData.userId) return;
    getDefaultAddress(authData.userId);
  }, [authData.userId, getDefaultAddress]);

  useEffect(() => {
    if (orders && orders.length == 0) {
      return;
    }
    api
      .post('/orders/check', mapToDataCheck(orders, selectedVouchers))
      .then((res) => {
        if (res.data.errors.length === 0) {
          setBooks(orders);
        } else {
          const errorCodes = res.data.errors;
          const errorMessagesMap: Record<string, string> = {
            '1001': 'Có sách không tồn tại',
            '1002': 'Có sách không đủ hàng',
            '1003': 'Có sách có thay đổi về giá',
            '2001': 'Mã giảm giá không hợp lệ',
          };
          if (Array.isArray(errorCodes)) {
            const mappedMessages = errorCodes
              .map((code: string) => errorMessagesMap[code])
              .filter(Boolean);
            setErrorMessages(mappedMessages);
          } else {
            setErrorMessages(['Đã xảy ra lỗi, vui lòng thử lại!']);
          }
        }
      })
      .catch(() => {
        toast.error('Đã xảy ra lỗi, vui lòng thử lại!');
        router.back();
      });
  }, [orders, selectedVouchers, router]);

  const handleSubmit = async () => {
    const addressData = await addressRef.current?.submit();
    if (!addressData) {
      if (!authData.userId || !guestEmail) {
        setGuestEmailErr(true);
      }
      return;
    }
    const rawAddress = mapAddressToDto(
      {
        ...addressData,
        provinceId: addressData.provinceId,
        wardId: addressData.wardId,
      },
      authData.userId ?? undefined
    );
    delete rawAddress.KH_id;
    delete rawAddress.NH_macDinh;
    const invoiceData = showInvoiceForm ? await invoiceRef.current?.submit() : null;
    const payload = {
      NH: rawAddress,
      DH: {
        DH_phiVC: shippingFee,
        KH_id: authData.userId ?? undefined,
        KH_email: authData.userId ? undefined : guestEmail,
        CTDH: books.map((c) => ({
          S_id: c.id,
          CTDH_soLuong: c.quantity,
          CTDH_giaNhap: c.costPrice,
          CTDH_giaBan: c.salePrice,
          CTDH_giaMua: c.discountPrice,
        })),
      },
      HD: invoiceData
        ? {
            HD_hoTen: invoiceData.name,
            HD_diaChi: invoiceData.address,
            HD_mst: invoiceData.taxCode,
            HD_email: invoiceData.email,
          }
        : undefined,
      MG: selectedVouchers.map((v) => ({ MG_id: v.code })),
      ...(paymentMethod !== 'COD' && { PhuongThucThanhToan: paymentMethod }),
    };
    setIsSubmitting(true);
    api
      .post('/orders', payload)
      .then((res) => {
        const order_url = res.data;
        setCreateSuccess(true);
        if (order_url) router.replace(order_url);
      })
      .catch((error) => {
        const errorCodes = error?.response?.data?.message;
        const errorMessagesMap: Record<string, string> = {
          '1001': 'Có sách không tồn tại',
          '1002': 'Có sách không đủ hàng',
          '1003': 'Có sách có thay đổi về giá',
          '2001': 'Mã giảm giá không hợp lệ',
          '4001': 'Lỗi thanh toán, vui lòng kiểm tra đơn hàng và thanh toán lại',
        };
        if (Array.isArray(errorCodes)) {
          const mappedMessages = errorCodes
            .map((code: string) => errorMessagesMap[code])
            .filter(Boolean);
          if (mappedMessages.length > 0) {
            setErrorMessages(mappedMessages);
          } else {
            setErrorMessages(['Đơn hàng tạo không thành công']);
          }
        } else {
          setErrorMessages(['Đơn hàng tạo không thành công']);
        }
      })
      .finally(() => setIsSubmitting(false));
  };

  useEffect(() => {
    if (errorMessages.length > 0) {
      const timer = setTimeout(() => {
        clearOrder();
        router.replace('/cart');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [errorMessages, router]);

  useEffect(() => {
    async function handleCartUpdate() {
      if (createSuccess) {
        const ids = books.map((b) => b.id);
        if (!authData?.userId) {
          removeFromCartByIds(books.map((b) => b.id));
        } else {
          try {
            await api.post('/carts/delete', { KH_id: authData.userId, S_id: ids });
            emitCartChange();
          } catch {
            toast.error('Lỗi cập nhật số lượng giỏ hàng');
          }
        }
        const timer = setTimeout(() => {
          clearOrder();
          router.replace('/cart');
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
    handleCartUpdate();
  }, [createSuccess, authData.userId, books, router]);

  if (!orders.length) return null;

  return (
    <div className="space-y-2">
      {isSubmitting && <Loader />}
      <section className="p-6 space-y-6 bg-white border rounded-md shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Thông tin nhận hàng</h2>
          {authData.userId && (
            <Button size="sm" onClick={() => setOpenSelectAddress(true)} className="cursor-pointer">
              Lựa chọn
            </Button>
          )}
        </div>
        {!authData.userId && (
          <div>
            <label
              htmlFor="guest-email"
              className={`text-sm font-medium block mb-1 ${
                guestEmailErr ? 'text-red-600' : 'text-zinc-700'
              }`}
            >
              Email nhận đơn hàng
            </label>
            <Input
              id="guest-email"
              placeholder="example@gmail.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className={guestEmailErr ? ' border-red-600 focus-visible:ring-red-600' : ''}
            />
            {guestEmailErr && (
              <p className="mt-2 text-sm text-red-600">Nhập email để nhận thông tin đơn hàng</p>
            )}
          </div>
        )}
        <AddressForm
          ref={addressRef}
          isComponent={true}
          defaultValue={address}
          onProvinceChange={(provinceId) => {
            api.get(`/shipping/inf/${provinceId}`).then((res) => {
              if (res.data) setShippingPolicy(mapShippingPolicyFromApi(res.data));
            });
          }}
        />
        {openSelectAddress && (
          <OverLay>
            <div className="flex items-center justify-center w-full h-full px-4 py-6">
              <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-md bg-white shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Chọn thông tin nhận hàng</h3>
                  <button onClick={() => setOpenSelectAddress(false)}>
                    <X />
                  </button>
                </div>
                <AddressList
                  isComponent
                  onSelectAddress={(a) => {
                    setAddress(a);
                    setOpenSelectAddress(false);
                  }}
                />
              </div>
            </div>
          </OverLay>
        )}
      </section>
      <section className="p-6 space-y-4 bg-white border rounded-md shadow">
        <div className="flex items-center gap-4">
          <h2 className="font-medium">Xuất hóa đơn</h2>
          <Checkbox
            checked={showInvoiceForm}
            onCheckedChange={(checked) => {
              setShowInvoiceForm(!!checked);
            }}
          />
        </div>
        {showInvoiceForm && <InvoiceForm ref={invoiceRef} />}
      </section>
      <VoucherSection
        selectedVouchers={selectedVouchers}
        setSelectedVouchers={setSelectedVouchers}
        orderTotal={orderTotal}
        isDisabled={!authData.userId}
      />
      <PaymentMethod value={paymentMethod} onChange={setPaymentMethod} />
      <BooksSection books={books} />
      <section className="p-6 space-y-6 bg-white border rounded-md shadow">
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <p>Tổng tiền hàng</p>
            <p>{formatCurrency(orderTotal)}</p>
          </div>
          <div className="flex justify-between">
            <p>Tổng tiền phí vận chuyển</p>
            <p>{shippingPolicy ? formatCurrency(shippingFee) : '———'}</p>
          </div>
          <div className="flex justify-between text-red-500">
            <p>Giảm giá phí vận chuyển</p>
            <p>-{formatCurrency(shippingDiscount)}</p>
          </div>
          <div className="flex justify-between text-red-500">
            <p>Giảm giá tiền hàng</p>
            <p>-{formatCurrency(productDiscount)}</p>
          </div>
          <div className="flex justify-between pt-1 font-medium border-t">
            <p>Tổng thanh toán</p>
            <p>{formatCurrency(total)}</p>
          </div>
        </div>
        <div
          className={clsx(
            'flex justify-end gap-2 items-center bg-white shadow px-4 py-3 border-t',
            'md:static md:shadow-none md:border-none md:p-0',
            'fixed bottom-0 left-0 right-0 z-30'
          )}
        >
          <div className="text-xs text-zinc-600">
            <p className="flex items-center justify-end gap-2">
              Tổng cộng{' '}
              <span className="text-base font-semibold text-red-500">{formatCurrency(total)}</span>
            </p>
            <p className="flex items-center justify-end gap-2">
              Tiết kiệm <span className="text-red-500">{formatCurrency(totalSaving)}</span>
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            className="px-8 rounded-md cursor-pointer md:rounded-sm"
            disabled={isSubmitting}
          >
            Đặt hàng
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              router.back();
            }}
            className="px-8 rounded-md cursor-pointer md:rounded-sm"
          >
            Hủy
          </Button>
        </div>
      </section>
      <OrderErrorDialog
        open={errorMessages.length !== 0}
        errorMessages={errorMessages}
        clearOrder={clearOrder}
      />
      <OrderSuccessDialog open={createSuccess} clearOrder={clearOrder} />
    </div>
  );
}
