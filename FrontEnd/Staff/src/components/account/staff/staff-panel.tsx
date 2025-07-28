'use client';

import StaffTable from '@/components/account/staff/staff-table';
import SwitchTab from '@/components/account/switchtab';
import api from '@/lib/axios-client';
import EventBus from '@/lib/event-bus';
import { Staff, mapStaffFormDto } from '@/models/accounts';
import { useEffect, useState } from 'react';

export default function StaffPanel() {
  const [data, setData] = useState<Staff[]>([]);
  async function getData() {
    try {
      const res = await api.get('/users/staffs');
      const data = res.data;
      setData(data.length > 0 ? mapStaffFormDto(data) : []);
    } catch {
      setData([]);
    }
  }

  useEffect(() => {
    getData();
    const handler = () => getData();
    EventBus.on('staff:refetch', handler);
    return () => {
      EventBus.off('staff:refetch', handler);
    };
  }, []);

  return (
    <div className="p-4">
      <div className="w-full p-4 space-y-4 bg-white rounded-sm shadow">
        <SwitchTab />
        <StaffTable data={data} />
      </div>
    </div>
  );
}
