import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/auth-context';

type Props = {
  value?: string;
  onChange?: (value: string) => void;
};

export default function PaymentMethod({ value = 'COD', onChange }: Readonly<Props>) {
  const [paymentMethod, setPaymentMethod] = useState<string>(value);
  const { authData } = useAuth();
  const handleChange = (val: string) => {
    setPaymentMethod(val);
    if (onChange) onChange(val);
  };

  return (
    <section className="p-6 space-y-4 bg-white border rounded-md shadow">
      <Label className="font-medium mb-8">Phương thức thanh toán</Label>
      <RadioGroup
        value={paymentMethod}
        onValueChange={handleChange}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2 cursor-pointer">
          <RadioGroupItem id="COD" value="COD" />
          <Label htmlFor="COD" className="cursor-pointer font-normal">
            Thanh toán khi nhận hàng
          </Label>
        </div>
        {authData.userId && (
          <div className="flex items-center space-x-2 cursor-pointer">
            <RadioGroupItem id="ZaloPay" value="ZaloPay" />
            <Label htmlFor="ZaloPay" className="cursor-pointer font-normal">
              Thanh toán qua ZaloPay
            </Label>
          </div>
        )}
      </RadioGroup>
    </section>
  );
}
