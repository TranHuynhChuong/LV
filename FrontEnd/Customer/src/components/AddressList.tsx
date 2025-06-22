'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axiosClient';
import { useAuth } from '@/contexts/AuthContext';
import { AddressType, mapApiListToAddressList } from '@/types/address';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils'; // nếu bạn dùng tailwind helper để gộp class
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from './ui/badge';

interface Props {
  address: AddressType;
  isComponent?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

export function AddressItem({ address, isComponent, selected, onSelect }: Readonly<Props>) {
  return (
    <div
      className={cn(
        'p-4 border rounded-md bg-white shadow-sm space-y-1 cursor-pointer',
        selected && 'border-blue-500 bg-blue-50'
      )}
      onClick={isComponent ? onSelect : undefined}
    >
      <div className="font-semibold text-sm flex justify-between flex-1">
        <span className="flex gap-1 flex-wrap">
          <p className="whitespace-nowrap">{address.name}</p>
          <p className="font-normal whitespace-nowrap text-muted-foreground">{address.phone}</p>
        </span>

        {!isComponent ? (
          <Link href={`/profile/addresses/${address.id}`} className="h-fit">
            <Button variant="outline" size="sm">
              Chỉnh sửa
            </Button>
          </Link>
        ) : (
          selected && <CheckCircle className="text-blue-500 w-4 h-4 mt-1" />
        )}
      </div>

      <div className="text-sm">
        {address.ward.name}, {address.province.name}
      </div>

      {address.note && <div className="text-xs italic text-muted-foreground">{address.note}</div>}

      {address.default && <Badge className="bg-zinc-600">Mặc định</Badge>}
    </div>
  );
}

interface AddressListProps {
  isComponent?: boolean;
  onSelectAddress?: (address: AddressType) => void;
}

export default function AddressList({ isComponent, onSelectAddress }: AddressListProps) {
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [selected, setSelected] = useState<AddressType | undefined>(undefined);
  const { authData } = useAuth();

  useEffect(() => {
    if (!authData.userId) return;
    api.get(`addresses/${authData.userId}`).then((res) => {
      mapApiListToAddressList(res.data).then((mapped) => {
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
    <div className="w-full bg-white space-y-6">
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
      <Button onClick={() => handleSelect()}>Xác nhận</Button>
    </div>
  );
}
