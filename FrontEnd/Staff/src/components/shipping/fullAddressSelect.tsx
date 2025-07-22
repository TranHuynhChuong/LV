'use client';

import { useEffect, useState } from 'react';
import Combobox from '@/components/utils/Combobox';
import api from '@/lib/axios';

interface AddressSelectProps {
  readonly onChange: (provinceId: number, wardId: number) => void;
  readonly valueProvinceId?: number;
  readonly valueWardId?: number;
}

export default function AddressSelect({
  onChange,
  valueProvinceId,
  valueWardId,
}: AddressSelectProps) {
  const [provincesData, setProvincesData] = useState<{ code: number; name: string }[]>([]);
  const [wardsData, setWardsData] = useState<{ code: number; name: string }[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    valueProvinceId ?? null
  );

  // Load danh sách tỉnh
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

  // Load xã nếu có tỉnh được chọn từ props ban đầu (dùng cho edit)
  useEffect(() => {
    if (!valueProvinceId) return;

    async function fetchWards() {
      try {
        const res = await api.get(`/location/${selectedProvinceId}`);
        const data = res.data;
        const mapped = data.map((item: { X_id: number; X_ten: string }) => ({
          code: item.X_id,
          name: item.X_ten,
        }));
        setWardsData(mapped);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu xã/phường:', err);
        setWardsData([]);
      }
    }

    fetchWards();
  }, [valueProvinceId]);

  // Khi chọn tỉnh
  const handleSelectProvince = async (provinceId: number) => {
    setSelectedProvinceId(provinceId);
    setWardsData([]);

    try {
      const res = await api.get(`/location/${selectedProvinceId}`);
      const data = res.data;
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

  // Khi chọn xã
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
