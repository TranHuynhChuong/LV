'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/axios-client';
import { cn } from '@/lib/utils';
import { Address, mapAddressListFromDto } from '@/models/address';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '../../ui/badge';

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
          <p className="whitespace-nowrap">{address.name}</p>
          <p className="font-normal whitespace-nowrap text-muted-foreground">{address.phone}</p>
        </span>
        {!isComponent ? (
          <Link href={`/profile/address/${address.id}`} className="h-fit">
            <Button variant="outline" size="sm" className="cursor-pointer">
              Chỉnh sửa
            </Button>
          </Link>
        ) : (
          selected && <CheckCircle className="w-4 h-4 mt-1 text-blue-500" />
        )}
      </div>
      <div className="text-sm">{address.fullName}</div>
      {address.note && <div className="text-xs italic text-muted-foreground">{address.note}</div>}
      {address.default && <Badge className="bg-zinc-600">Mặc định</Badge>}
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
      mapAddressListFromDto(res.data).then((mapped) => {
        setAddresses(mapped);
      });
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
            key={a.id}
            address={a}
            isComponent={isComponent}
            selected={selected?.id === a.id}
            onSelect={() => setSelected(a)}
          />
        ))}
      </div>
      {isComponent && <Button onClick={() => handleSelect()}>Xác nhận</Button>}
    </div>
  );
}
