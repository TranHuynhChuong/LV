'use client';

import { useEffect, useState } from 'react';
import AddressItem from './addressItem';
import api from '@/lib/axiosClient';
import { useAuth } from '@/contexts/AuthContext';
import { AddressType, mapApiListToAddressList } from '@/types/address';

export default function AddressList() {
  const [addresses, setAddresses] = useState<AddressType[]>([]); // mock data hoặc fetch
  const { authData } = useAuth();

  useEffect(() => {
    if (!authData.userId) return;
    api.get(`addresses/${authData.userId}`).then((res) => {
      mapApiListToAddressList(res.data).then((mapped) => {
        setAddresses(mapped);
      });
    });
  }, [authData.userId]);

  return (
    <div className="w-full  bg-white ">
      <div className="space-y-2">
        {addresses.map((a) => (
          <AddressItem key={a.id} address={a} />
        ))}
      </div>
    </div>
  );
}
