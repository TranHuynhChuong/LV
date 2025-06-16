'use client';

import { useState } from 'react';
import AddressItem from './components/addressItem';
import AddressForm from './components/addressForm';

export default function ShippingAddressPage() {
  const [addresses, setAddresses] = useState<any[]>([]); // mock data hoặc fetch
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = (data: any) => {
    if (editing) {
      setAddresses((prev) => prev.map((a) => (a.id === editing.id ? { ...a, ...data } : a)));
    } else {
      setAddresses((prev) => [...prev, { id: Date.now(), ...data }]);
    }
    setEditing(null);
    setShowForm(false);
  };

  const setDefault = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, macDinh: a.id === id })));
  };

  return (
    <div className="w-full p-6 bg-white shadow rounded-md space-y-6">
      <h1 className="text-xl font-bold">Thông tin nhận hàng</h1>

      {showForm && <AddressForm onSubmit={handleSave} defaultValue={editing} />}

      <button
        className="text-sm text-blue-600 underline"
        onClick={() => {
          setShowForm(true);
          setEditing(null);
        }}
      >
        + Thêm địa chỉ mới
      </button>

      <div className="space-y-4">
        {addresses.map((a) => (
          <AddressItem
            key={a.id}
            address={a}
            onEdit={() => {
              setEditing(a);
              setShowForm(true);
            }}
            onSetDefault={() => setDefault(a.id)}
          />
        ))}
      </div>
    </div>
  );
}
