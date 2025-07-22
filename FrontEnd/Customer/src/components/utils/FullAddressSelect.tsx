'use client';

import { useEffect, useState } from 'react';
import Combobox from '@/components/utils/Combobox';
import clsx from 'clsx';
import api from '@/lib/axios';

interface AddressSelectProps {
  readonly onSelectProvince: (provinceId: number) => void;
  readonly onSelectWard: (wardId: number) => void;
  readonly valueProvinceId?: number;
  readonly valueWardId?: number;
  readonly error?: boolean;
}

export default function AddressSelect({
  onSelectProvince,
  onSelectWard,
  valueProvinceId,
  valueWardId,
  error,
}: AddressSelectProps) {
  const [provincesData, setProvincesData] = useState<{ code: number; name: string }[]>([]);
  const [wardsData, setWardsData] = useState<{ code: number; name: string }[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    valueProvinceId ?? null
  );

  // Load danh sách tỉnh
  useEffect(() => {
    async function fetchProvinces() {
      const res = await api.get(`/location/0`);
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
    async function fetchWards() {
      try {
        if (!selectedProvinceId) return;
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
    onSelectProvince(provinceId);
    try {
      if (!selectedProvinceId) return;
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
      onSelectWard(wardId);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className={clsx('text-sm font-medium mb-1', error ? 'text-red-600' : '')}>
          Tỉnh/thành phố
        </p>
        <Combobox
          data={provincesData}
          value={valueProvinceId}
          onSelect={handleSelectProvince}
          error={error}
          placeholders={{
            select: 'Chọn tỉnh/thành phố...',
            search: 'Nhập tên tỉnh/thành phố...',
            empty: 'Không tìm thấy tỉnh/thành phố.',
          }}
        />
      </div>

      <div>
        <p className={clsx('text-sm font-medium mb-1', error ? 'text-red-600' : '')}>Xã/phường</p>
        <Combobox
          data={wardsData}
          value={valueWardId}
          onSelect={handleSelectWard}
          error={error}
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
