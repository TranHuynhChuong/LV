'use client';

import { Voucher } from '@/models/voucher';
import { ChevronRight, Ticket } from 'lucide-react';
import { useState } from 'react';
import VoucherSelector from './voucher-selector';

type VoucherSectionProps = {
  selectedVouchers: Voucher[];
  setSelectedVouchers: (vouchers: Voucher[]) => void;
  orderTotal: number;
  isDisabled: boolean;
};

export default function VoucherSection({
  selectedVouchers,
  setSelectedVouchers,
  orderTotal,
  isDisabled,
}: Readonly<VoucherSectionProps>) {
  const [openSelectVoucher, setOpenSelectVoucher] = useState(false);

  return (
    <section className="p-6 bg-white border rounded-md shadow ">
      <button
        className="items-center justify-between w-full space-y-2 text-sm"
        onClick={() => setOpenSelectVoucher(true)}
        disabled={isDisabled}
      >
        <div className="flex items-center justify-between flex-1 gap-2">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <Ticket /> Mã giảm giá
          </span>

          {!isDisabled ? (
            <span
              className={`text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap 
        ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              Chọn mã giảm giá <ChevronRight size={14} />
            </span>
          ) : (
            <span className="flex justify-end w-full text-xs italic text-muted-foreground">
              Vui lòng đăng nhập để sử dụng mã giảm giá
            </span>
          )}
        </div>

        <div className="flex items-center justify-end flex-1 gap-2">
          <div className="flex gap-1 text-xs">
            {selectedVouchers.map((v) => (
              <div key={v.voucherId} className="flex items-center gap-1">
                <span className="px-4 py-2 rounded-sm text-primary bg-zinc-200 whitespace-nowrap">
                  {v.type === 'vc' ? 'Giảm vận chuyển' : 'Giảm hóa đơn'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </button>

      {openSelectVoucher && (
        <VoucherSelector
          selected={selectedVouchers}
          onChange={setSelectedVouchers}
          orderTotal={orderTotal}
          onClose={() => setOpenSelectVoucher(false)}
        />
      )}
    </section>
  );
}
