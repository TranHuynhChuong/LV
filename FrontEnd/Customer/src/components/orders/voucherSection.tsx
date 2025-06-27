'use client';

import { ChevronRight, Ticket } from 'lucide-react';
import VoucherSelector, { Voucher } from './selectVoucher';
import { useState } from 'react';

type Props = {
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
}: Readonly<Props>) {
  const [openSelectVoucher, setOpenSelectVoucher] = useState(false);

  return (
    <section className="p-6 bg-white border rounded-md shadow  ">
      <button
        className="items-center justify-between space-y-2 w-full text-sm"
        onClick={() => setOpenSelectVoucher(true)}
        disabled={isDisabled}
      >
        <div className="flex flex-1 justify-between items-center gap-2">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <Ticket /> Mã giảm giá
          </span>

          <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
            Chọn mã giảm giá <ChevronRight size={14} />
          </span>
        </div>

        <div className="flex flex-1  justify-end items-center gap-2">
          <div className="flex  gap-1 text-xs">
            {selectedVouchers.map((v) => (
              <div key={v.code} className="flex items-center gap-1">
                <span className="text-primary py-2 px-4 bg-zinc-200 rounded-sm whitespace-nowrap">
                  {v.type === 1 ? 'Giảm vận chuyển' : 'Giảm hóa đơn'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </button>
      {isDisabled && (
        <span className="flex w-full justify-end text-xs text-muted-foreground italic">
          Vui lòng đăng nhập để sử dụng mã giảm giá
        </span>
      )}
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
