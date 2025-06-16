'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type AddressItemProps = {
  address: {
    id: string;
    hoTen: string;
    soDienThoai: string;
    tinh: string;
    xa: string;
    ghiChu?: string;
    macDinh: boolean;
  };
  onEdit: () => void;
  onSetDefault: () => void;
};

export default function AddressItem({ address, onEdit, onSetDefault }: AddressItemProps) {
  return (
    <div className="p-4 border rounded-md bg-white shadow-sm space-y-1">
      <div className="font-semibold">
        {address.hoTen} - {address.soDienThoai}{' '}
        {address.macDinh && <Badge className="ml-2 bg-green-600">Mặc định</Badge>}
      </div>
      <div>
        {address.xa}, {address.tinh}
      </div>
      {address.ghiChu && (
        <div className="text-sm italic text-muted-foreground">{address.ghiChu}</div>
      )}
      <div className="flex gap-2 mt-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          Cập nhật
        </Button>
        {!address.macDinh && (
          <Button variant="ghost" size="sm" onClick={onSetDefault}>
            Đặt mặc định
          </Button>
        )}
      </div>
    </div>
  );
}
