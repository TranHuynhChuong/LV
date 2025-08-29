'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/axios-client';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '../../ui/badge';
import { Address } from '@/models/address';

type AddressItemProps = {
  address: Address;
  isComponent?: boolean;
  selected?: boolean;
  onSelect?: () => void;
};

export function AddressItem({
  address,
  isComponent,
  selected,
  onSelect,
}: Readonly<AddressItemProps>) {
  return (
    <div
      className={cn(
        'p-4 border rounded-md bg-white shadow-sm space-y-1',
        selected && 'border-blue-500 bg-blue-50',
        isComponent && 'cursor-pointer'
      )}
      onClick={isComponent ? onSelect : undefined}
    >
      <div className="flex justify-between flex-1 text-sm font-semibold">
        <span className="flex flex-wrap gap-1">
          <p className="whitespace-nowrap">{address.fullName}</p>
          <p className="font-normal whitespace-nowrap text-muted-foreground">{address.phone}</p>
        </span>
        {!isComponent ? (
          <Link href={`/profile/address/${address.addressId}`} className="h-fit">
            <Button variant="outline" size="sm" className="cursor-pointer">
              Chỉnh sửa
            </Button>
          </Link>
        ) : (
          selected && <CheckCircle className="w-4 h-4 mt-1 text-blue-500" />
        )}
      </div>
      <div className="text-sm">{address.address}</div>
      {address.note && <div className="text-xs italic text-muted-foreground">{address.note}</div>}
      {address.isDefault && <Badge className="bg-zinc-600">Mặc định</Badge>}
    </div>
  );
}

type AddressListProps = {
  isComponent?: boolean;
  onSelectAddress?: (address: Address) => void;
};

export default function AddressList({ isComponent, onSelectAddress }: Readonly<AddressListProps>) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selected, setSelected] = useState<Address | undefined>(undefined);
  const { authData } = useAuth();

  useEffect(() => {
    if (!authData.userId) return;
    api.get(`addresses/${authData.userId}`).then((res) => {
      setAddresses(res.data);
    });
  }, [authData.userId]);

  const handleSelect = () => {
    if (selected) {
      onSelectAddress?.(selected);
    }
  };

  return (
    <div className="w-full space-y-6 bg-white">
      <div className="space-y-2">
        {addresses.map((a) => (
          <AddressItem
            key={a.addressId}
            address={a}
            isComponent={isComponent}
            selected={selected?.addressId === a.addressId}
            onSelect={() => setSelected(a)}
          />
        ))}
      </div>
      {isComponent && (
        <Button onClick={() => handleSelect()} className="cursor-pointer">
          Xác nhận
        </Button>
      )}
    </div>
  );
}
