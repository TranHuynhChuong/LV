'use client';

import { useEffect, useState } from 'react';
import Combobox from '@/components/utils/combobox';
import api from '@/lib/axios-client';

type Props = {
  onChange: (provinceId: number, wardId: number) => void;
  valueProvinceId?: number;
  valueWardId?: number;
};

export default function AddressSelect({ onChange, valueProvinceId, valueWardId }: Readonly<Props>) {
  const [provincesData, setProvincesData] = useState<{ code: number; name: string }[]>([]);
  const [wardsData, setWardsData] = useState<{ code: number; name: string }[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    valueProvinceId ?? null
  );

  useEffect(() => {
    async function fetchProvinces() {
      const res = await api.get('/location/0');
      const data = res.data;
      const mapped = data.map((item: { T_id: number; T_ten: string }) => ({
        code: item.T_id,
        name: item.T_ten,
      }));
      setProvincesData(mapped);
    }
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!valueProvinceId) return;
    async function fetchWards() {
      try {
        const res = await api.get(`/location/${valueProvinceId}`);
        const data = res.data;
        const mapped = data.map((item: { X_id: number; X_ten: string }) => ({
          code: item.X_id,
          name: item.X_ten,
        }));
        setWardsData(mapped);
      } catch {
        setWardsData([]);
      }
    }

    fetchWards();
  }, [valueProvinceId]);

  const handleSelectProvince = async (provinceId: number) => {
    setSelectedProvinceId(provinceId);
    setWardsData([]);

    try {
      const res = await api.get(`/location/${provinceId}`);
      const data = res.data;
      const mapped = data.map((item: { X_id: number; X_ten: string }) => ({
        code: item.X_id,
        name: item.X_ten,
      }));
      setWardsData(mapped);
    } catch {
      setWardsData([]);
    }
  };

  const handleSelectWard = (wardId: number) => {
    const provinceId = selectedProvinceId ?? valueProvinceId;
    if (provinceId != null) {
      onChange(provinceId, wardId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-sm font-medium">Chọn tỉnh/thành phố</span>
        <Combobox
          data={provincesData}
          value={valueProvinceId}
          onSelect={handleSelectProvince}
          placeholders={{
            select: 'Chọn tỉnh/thành phố...',
            search: 'Nhập tên tỉnh/thành phố...',
            empty: 'Không tìm thấy tỉnh/thành phố.',
          }}
        />
      </div>

      <div>
        <span className="text-sm font-medium">Chọn xã/phường</span>
        <Combobox
          data={wardsData}
          value={valueWardId}
          onSelect={handleSelectWard}
          placeholders={{
            select: 'Chọn xã/phường...',
            search: 'Nhập tên xã/phường...',
            empty: 'Không tìm thấy xã/phường.',
          }}
        />
      </div>
    </div>
  );
}
