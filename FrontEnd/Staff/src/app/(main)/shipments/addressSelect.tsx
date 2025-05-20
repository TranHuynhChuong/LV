'use client';

import { useEffect, useState } from 'react';
import Combobox from '@/components/Combobox';

interface AddressSelectProps {
  onChange: (provinceId: number, wardId: number) => void;
}

export default function AddressSelect({ onChange }: AddressSelectProps) {
  const [provincesData, setProvincesData] = useState<{ code: number; name: string }[]>([]);
  const [wardsData, setWardsData] = useState<{ code: number; name: string }[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchProvinces() {
      const res = await fetch('/data/0.json');
      const data = await res.json();
      const mapped = data.map((item: { T_id: number; T_ten: string }) => ({
        code: item.T_id,
        name: item.T_ten,
      }));
      setProvincesData(mapped);
    }
    fetchProvinces();
  }, []);

  const handleSelectProvince = async (provinceId: number) => {
    setSelectedProvinceId(provinceId);
    setWardsData([]); // reset xã/phường ban đầu

    try {
      const res = await fetch(`/data/${provinceId}.json`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setWardsData([]);
        return;
      }
      const mapped = data.map((item: { X_id: number; X_ten: string }) => ({
        code: item.X_id,
        name: item.X_ten,
      }));

      setWardsData(mapped);
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu xã/phường:', err);
      setWardsData([]);
    }
  };

  const handleSelectWard = (wardId: number) => {
    if (selectedProvinceId !== null) {
      onChange(selectedProvinceId, wardId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span>Chọn tỉnh/thành phố</span>
        <Combobox data={provincesData} type="province" onSelect={handleSelectProvince} />
      </div>

      <div>
        <span>Chọn xã/phường</span>
        <Combobox data={wardsData} type="ward" onSelect={handleSelectWard} />
      </div>
    </div>
  );
}
