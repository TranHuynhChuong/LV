'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import Overlay from '@/components/OverLay';
import api from '@/lib/axiosClient';
import { Button } from '@/components/ui/button';
import { BadgePercent, Ticket, Truck, X } from 'lucide-react';

export type Voucher = {
  type: number;
  code: string;
  from: Date;
  to: Date;
  isPercentage: boolean;
  discountValue: number;
  name: string;
  minOrderValue: number;
  maxDiscount?: number;
};

type MaGiam = {
  MG_id: string;
  MG_ten: string;
  MG_batDau: Date;
  MG_ketThuc: Date;
  MG_theoTyLe: boolean;
  MG_giaTri: number;
  MG_loai: number;
  MG_toiThieu: number;
  MG_toiDa?: number;
};

function mapMaGiamToVoucher(maGiamList: MaGiam[]): Voucher[] {
  return maGiamList.map((mg) => ({
    type: mg.MG_loai,
    code: mg.MG_id,
    from: new Date(mg.MG_batDau),
    to: new Date(mg.MG_ketThuc),
    isPercentage: mg.MG_theoTyLe,
    discountValue: mg.MG_giaTri,
    name: mg.MG_ten,
    minOrderValue: mg.MG_toiThieu,
    maxDiscount: mg.MG_toiDa,
  }));
}

type Props = {
  selected: Voucher[];
  onChange: (selected: Voucher[]) => void;
  orderTotal: number;
  onClose?: () => void;
};

export default function VoucherSelector({
  selected: initialSelected,
  onChange,
  orderTotal,
  onClose,
}: Readonly<Props>) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Voucher[]>(initialSelected);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await api.get('/vouchers/allValid');
        setVouchers(mapMaGiamToVoucher(res.data));
      } catch (error) {
        console.error('Lỗi lấy danh sách voucher:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const toggle = (id: string, disabled: boolean) => {
    if (disabled) return;

    const clicked = vouchers.find((v) => v.code === id);
    if (!clicked) return;

    setSelected((prev) => {
      const isSelected = prev.some((v) => v.code === id);

      if (isSelected) {
        return prev.filter((v) => v.code !== id);
      }

      // Only add full Voucher objects
      return [...prev.filter((v) => v.type !== clicked.type), clicked];
    });
  };

  const grouped = {
    shipping: vouchers.filter((v) => v.type === 1),
    order: vouchers.filter((v) => v.type === 2),
  };

  const handleConfirm = () => {
    onChange(selected);
    onClose?.();
  };

  if (loading) return null;

  return (
    <Overlay>
      <div className="flex flex-col items-center justify-center h-full w-full py-6 px-2 sm:px-6">
        <div className="bg-white rounded-md shadow p-4 w-full max-w-lg max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold flex items-center gap-2">
              <Ticket /> Chọn mã giảm giá
            </h2>
            <Button variant="ghost" onClick={onClose}>
              <X />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[60vh] pr-1 space-y-6">
            <VoucherGroup
              title="Ưu đãi phí vận chuyển"
              vouchers={grouped.shipping}
              selected={selected}
              orderTotal={orderTotal}
              onToggle={toggle}
            />
            <VoucherGroup
              title="Ưu đãi đơn hàng"
              vouchers={grouped.order}
              selected={selected}
              orderTotal={orderTotal}
              onToggle={toggle}
            />
          </div>

          <div className="pt-4 text-right">
            <Button onClick={handleConfirm}>Áp dụng</Button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

type GroupProps = {
  title: string;
  vouchers: Voucher[];
  selected: Voucher[];
  orderTotal: number;
  onToggle: (id: string, disabled: boolean) => void;
};

function VoucherGroup({ title, vouchers, selected, orderTotal, onToggle }: Readonly<GroupProps>) {
  if (!vouchers.length) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-accent-foreground text-sm">{title}</h3>
      {vouchers.map((voucher) => {
        const isDisabled = orderTotal < voucher.minOrderValue;
        const isChecked = selected.some((s) => s.code === voucher.code);

        return (
          <div
            key={voucher.code}
            className={cn(
              'flex items-center justify-between py-1 pl-1 pr-3 rounded border shadow-sm gap-4',
              isDisabled ? 'opacity-50 cursor-not-allowed bg-zinc-100' : 'hover:bg-zinc-50'
            )}
          >
            <div className="flex gap-3 items-center w-full min-w-fit">
              <div className="w-18 h-18 rounded bg-primary text-white flex flex-col items-center justify-center text-xs">
                {voucher.type === 1 ? (
                  <>
                    <Truck className="w-4 h-4" />
                    Freeship
                  </>
                ) : (
                  <>
                    <BadgePercent className="w-4 h-4" />
                    Mã giảm
                  </>
                )}
              </div>

              <div className="flex-1 space-y-1 text-xs">
                <p className="font-medium text-accent-foreground">
                  Giảm{' '}
                  {voucher.isPercentage
                    ? `${voucher.discountValue}%`
                    : `₫${voucher.discountValue.toLocaleString()}`}
                  {voucher.isPercentage && voucher.maxDiscount
                    ? ` (Tối đa ₫${voucher.maxDiscount.toLocaleString()})`
                    : ''}
                </p>

                <p className="text-muted-foreground">
                  Đơn tối thiểu ₫{voucher.minOrderValue.toLocaleString()}
                </p>

                <p className="text-muted-foreground">
                  HSD: {voucher.to.toLocaleDateString('vi-VN')}
                </p>
              </div>

              <Checkbox
                checked={isChecked}
                disabled={isDisabled}
                onCheckedChange={() => onToggle(voucher.code, isDisabled)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
