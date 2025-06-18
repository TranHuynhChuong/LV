'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddressType } from '@/types/address';
import Link from 'next/link';

interface Props {
  address: AddressType;
}

export default function AddressItem({ address }: Readonly<Props>) {
  return (
    <div className="p-4 border rounded-md bg-white shadow-sm space-y-1 ">
      <div className="font-semibold text-sm flex justify-between flex-1 ">
        <span className="flex gap-1 flex-wrap">
          <p className=" whitespace-nowrap">{address.name}</p>

          <p className="font-normal  whitespace-nowrap text-muted-foreground">{address.phone} </p>
        </span>
        <Link href={`/profile/addresses/${address.createAt}`} className="h-fit ">
          <Button variant="outline" size="sm" className="cursor-pointer">
            Chỉnh sửa
          </Button>
        </Link>
      </div>
      <div className="text-sm">
        {address.ward.name}, {address.province.name}
      </div>
      {address.note && <div className="text-xs italic text-muted-foreground">{address.note}</div>}
      {address.default && <Badge className=" bg-zinc-600">Mặc định</Badge>}
    </div>
  );
}
