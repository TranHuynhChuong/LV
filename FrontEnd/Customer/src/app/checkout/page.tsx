'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useOrderStore } from '@/stores/orderStore';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

import AddressList from '@/components/profiles/addresses/AddressList';
import OverLay from '@/components/utils/OverLay';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCheck, CircleAlert, X } from 'lucide-react';
import clsx from 'clsx';

import { Checkbox } from '@/components/ui/checkbox';
import Loader from '@/components/utils/Loader';
import { useCartStore } from '@/stores/cart.store';
import { emitCartChange } from '@/lib/cartEvents';
import AddressForm, { AddressFormHandle } from '@/components/profiles/addresses/addressForm';
import InvoiceForm, { InvoiceFormHandle } from '@/components/checkOuts/invoiceForm';
import ProductsOrderSection from '@/components/checkOuts/productsOrderSection';
import VoucherSection from '@/components/checkOuts/voucherSection';
import { Address, mapAddressListFromDto, mapAddressToDto } from '@/models/addresses';
import { Cart } from '@/models/carts';
import { Voucher } from '@/models/vouchers';

// --- Utils ---
type ShippingPolicy = {
  extraUnitGrams: number;
  baseWeightLimitKg: number;
  baseFee: number;
  extraFeePerUnit: number;
};

type ShippingApiResponse = {
  PVC_dvpp: number;
  PVC_ntl: number;
  PVC_phi: number;
  PVC_phuPhi: number;
};

function mapShippingPolicyFromApi(api: ShippingApiResponse): ShippingPolicy {
  return {
    extraUnitGrams: api.PVC_dvpp,
    baseWeightLimitKg: api.PVC_ntl,
    baseFee: api.PVC_phi,
    extraFeePerUnit: api.PVC_phuPhi,
  };
}

function calculateShippingFee(products: Cart[], policy: ShippingPolicy): number {
  const totalWeightGrams = products.reduce((total, p) => total + p.weight * p.quantity, 0);
  const baseLimitGrams = policy.baseWeightLimitKg * 1000;

  if (totalWeightGrams <= baseLimitGrams) return policy.baseFee;

  const excessGrams = totalWeightGrams - baseLimitGrams;
  const extraUnits = Math.ceil(excessGrams / policy.extraUnitGrams);
  return policy.baseFee + extraUnits * policy.extraFeePerUnit;
}

function calculateDiscounts(
  vouchers: Voucher[],
  orderTotal: number,
  shippingFee: number
): { productDiscount: number; shippingDiscount: number } {
  let productDiscount = 0;
  let shippingDiscount = 0;

  for (const v of vouchers) {
    if (orderTotal < v.minOrderValue) continue;

    const base = v.type === 'hd' ? orderTotal : shippingFee;
    let discount = v.isPercentage ? Math.floor((v.discountValue / 100) * base) : v.discountValue;
    if (v.maxDiscount !== undefined) discount = Math.min(discount, v.maxDiscount);

    if (v.type === 'hd') productDiscount += discount;
    else if (v.type === 'vc') shippingDiscount += discount;
  }

  return { productDiscount, shippingDiscount };
}

function mapToDataCheck(products: Cart[], vouchers: { code: string; type: string }[]) {
  const CTDH = products.map((c) => ({
    SP_id: c.productId,
    CTDH_soLuong: c.quantity,
    CTDH_giaNhap: c.costPrice,
    CTDH_giaBan: c.salePrice,
    CTDH_giaMua: c.discountPrice,
  }));
  const MG = vouchers.length > 0 ? vouchers.map((v) => ({ MG_id: v.code })) : undefined;
  return { CTDH, MG };
}

const formatCurrency = (value: number) => value.toLocaleString() + 'đ';

const useOrderSummary = (
  products: Cart[],
  shippingPolicy: ShippingPolicy | undefined,
  vouchers: Voucher[]
) => {
  const orderTotal = useMemo(
    () => products.reduce((sum, p) => sum + p.discountPrice * p.quantity, 0),
    [products]
  );

  const shippingFee = useMemo(
    () => (shippingPolicy ? calculateShippingFee(products, shippingPolicy) : 0),
    [products, shippingPolicy]
  );

  const { productDiscount, shippingDiscount } = useMemo(
    () => calculateDiscounts(vouchers, orderTotal, shippingFee),
    [vouchers, orderTotal, shippingFee]
  );
  const orderTotalUnit = useMemo(
    () => products.reduce((sum, p) => sum + p.salePrice * p.quantity, 0),
    [products]
  );

  const total = orderTotal + shippingFee - productDiscount - shippingDiscount;
  const totalSaving = productDiscount + shippingDiscount + (orderTotal - orderTotalUnit);

  return { orderTotal, shippingFee, productDiscount, shippingDiscount, total, totalSaving };
};

// --- Main Component ---
export default function CheckOutPage() {
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
  const [products, setProducts] = useState<Cart[]>([]);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestEmailErr, setGuestEmailErr] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { orderTotal, shippingFee, productDiscount, shippingDiscount, total, totalSaving } =
    useOrderSummary(products, shippingPolicy, selectedVouchers);

  const [createSuccess, setCreateSuccess] = useState(false);
  const removeFromCartByIds = useCartStore((state) => state.removeFromCartByIds);

  const fetchAndSetDefaultAddress = async (userId: number) => {
    try {
      const res = await api.get(`addresses/${userId}`);
      const mapped = await mapAddressListFromDto(res.data);
      const defaultAddress = mapped.find((a) => a.default);
      setAddress(defaultAddress);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!authData.userId) return;
    fetchAndSetDefaultAddress(authData.userId);
  }, [authData.userId]);

  useEffect(() => {
    if (orders && orders.length == 0) {
      return;
    }

    api
      .post('/orders/check', mapToDataCheck(orders, selectedVouchers))
      .then((res) => {
        if (res.data.errors.length === 0) {
          setProducts(orders);
        } else {
          setErrorMessages(res.data.errors);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, [orders, selectedVouchers]);

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
        province: { id: addressData.provinceId },
        ward: { id: addressData.wardId },
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
        CTDH: products.map((c) => ({
          SP_id: c.productId,
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
            HD_mstKh: invoiceData.taxCode,
            HD_email: invoiceData.email,
          }
        : undefined,
      MG: selectedVouchers.map((v) => ({ MG_id: v.code })),
    };

    setIsSubmitting(true);
    api
      .post('/orders', payload)
      .then((res) => {
        setCreateSuccess(true);
        console.log(res.data);
      })
      .catch((error) => {
        const errorCodes = error?.response?.data?.message?.message;

        const errorMessagesMap: Record<string, string> = {
          '1001': 'Có sản phẩm không tồn tại',
          '1002': 'Có sản phẩm không đủ hàng',
          '1003': 'Có sản phẩm có thay đổi về giá',
          '2001': 'Có sản phẩm đã ngừng bán',
        };

        if (Array.isArray(errorCodes)) {
          const mappedMessages = errorCodes
            .map((code: string) => errorMessagesMap[code])
            .filter(Boolean); // loại bỏ undefined nếu có mã lỗi không xác định

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
        router.replace('/carts');
      }, 3500); // 3.5 giây

      return () => clearTimeout(timer);
    }
  }, [errorMessages]);

  useEffect(() => {
    async function handleCartUpdate() {
      if (createSuccess) {
        const spIds = products.map((p) => p.productId);
        if (!authData?.userId) {
          removeFromCartByIds(products.map((p) => p.productId));
        } else {
          try {
            await api.post('/carts/delete', { KH_id: authData.userId, SP_id: spIds });

            emitCartChange();
          } catch (error) {
            console.error('Lỗi cập nhật số lượng:', error);
          }
        }

        const timer = setTimeout(() => {
          clearOrder();
          router.replace('/carts');
        }, 2000); // 2 giây

        return () => clearTimeout(timer);
      }
    }
    handleCartUpdate();
  }, [createSuccess]);

  if (!orders.length) return null;

  return (
    <div className="space-y-2">
      {isSubmitting && <Loader />}
      <section className="rounded-md shadow border bg-white p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Thông tin nhận hàng</h2>
          {authData.userId && (
            <Button size="sm" onClick={() => setOpenSelectAddress(true)}>
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
              <p className="text-sm text-red-600 mt-2">Nhập email để nhận thông tin đơn hàng</p>
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
            <div className="flex items-center justify-center px-4 py-6 w-full h-full">
              <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-md bg-white shadow p-6">
                <div className="flex justify-between items-center mb-4">
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

      <section className="p-6 bg-white border rounded-md shadow space-y-4">
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

      <ProductsOrderSection products={products} />

      <section className="p-6 bg-white border rounded-md shadow space-y-6">
        <div className="text-sm text-muted-foreground space-y-1">
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
          <div className="flex justify-between border-t pt-1 font-medium">
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
            <p className="flex gap-2 items-center justify-end">
              Tổng cộng{' '}
              <span className="font-semibold text-red-500 text-base">{formatCurrency(total)}</span>
            </p>
            <p className="flex gap-2 items-center justify-end">
              Tiết kiệm <span className="text-red-500">{formatCurrency(totalSaving)}</span>
            </p>
          </div>
          <Button onClick={handleSubmit} className="rounded-md md:rounded-sm px-8 cursor-pointer">
            Đặt hàng
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              router.back();
            }}
            className="rounded-md md:rounded-sm px-8  cursor-pointer"
          >
            Hủy
          </Button>
        </div>
      </section>

      <Dialog
        open={errorMessages.length !== 0}
        onOpenChange={(open) => {
          if (!open) {
            clearOrder();
            router.replace('/cart');
          }
        }}
      >
        <DialogContent>
          <DialogHeader className="flex flex-col items-center">
            <DialogTitle>Không thể tạo đơn hàng!</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="w-full flex flex-col items-center">
            <CircleAlert size={48} color="red" />
            <ul className="text-xs  text-center list-inside mt-2 space-y-1">
              {errorMessages.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <div className="flex flex-col  items-center w-full ">
              <p className="text-ms text-muted-foreground ">Vui lòng kiểm tra và thử lại!</p>
              <p className="text-xs text-muted-foreground ">
                Bạn sẽ được chuyển về giỏ hàng trong giây lát...
              </p>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createSuccess}
        onOpenChange={(open) => {
          if (!open) {
            clearOrder();
            router.replace('/cart');
          }
        }}
      >
        <DialogContent>
          <DialogHeader className="flex flex-col items-center">
            <DialogTitle>Đơn hàng được tạo thành công</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="w-full flex flex-col items-center">
            <CheckCheck size={48} color="green" />
            <p className="text-xs  text-center  list-inside mt-2 space-y-1">
              Đơn hàng đã được tạo thành công, vui lòng kiểm tra email.
            </p>
          </div>
          <DialogFooter>
            <div className="flex flex-col  items-center w-full ">
              <p className="text-xs text-muted-foreground ">
                Bạn sẽ được chuyển về giỏ hàng trong giây lát...
              </p>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
