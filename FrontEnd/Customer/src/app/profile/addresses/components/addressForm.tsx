'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import AddressSelect from '@/components/fullAddressSelect';

type AddressFormProps = {
  onSubmit: (data: any) => void;
  defaultValue?: any;
};

export default function AddressForm({ onSubmit, defaultValue }: AddressFormProps) {
  const [form, setForm] = useState({
    hoTen: defaultValue?.hoTen || '',
    soDienThoai: defaultValue?.soDienThoai || '',
    tinh: defaultValue?.tinh || '',
    xa: defaultValue?.xa || '',
    ghiChu: defaultValue?.ghiChu || '',
    macDinh: defaultValue?.macDinh || false,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4 p-4 border rounded-md bg-white"
    >
      <div>
        <Label>Họ tên</Label>
        <Input
          value={form.hoTen}
          onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
          required
        />
      </div>
      <div>
        <Label>Số điện thoại</Label>
        <Input
          value={form.soDienThoai}
          onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })}
          required
        />
      </div>
      <div>
        <AddressSelect
          onChange={(provinceId: number, wardId: number) =>
            setForm({ ...form, tinh: provinceId, xa: wardId })
          }
        />
      </div>
      <div></div>
      <div>
        <Label>Ghi chú</Label>
        <Input value={form.ghiChu} onChange={(e) => setForm({ ...form, ghiChu: e.target.value })} />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.macDinh}
          onChange={(e) => setForm({ ...form, macDinh: e.target.checked })}
        />
        <Label className="text-sm">Đặt làm địa chỉ mặc định</Label>
      </div>
      <Button type="submit">Lưu</Button>
    </form>
  );
}
