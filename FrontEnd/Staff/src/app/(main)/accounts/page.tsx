'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import api from '@/lib/axiosClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import StaffTable from './components/staffTable';
import CustomerTable from './components/customerTable';

export default function Accounts() {
  const { setBreadcrumbs } = useBreadcrumb();
  const [staff, setStaff] = useState(0);
  const [customer, setCustomer] = useState(0);
  const getCount = async () => {
    try {
      const res = await api.get('users/total');
      const data = res.data;
      setStaff(data.staff);
      setCustomer(data.customer);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Tài khoản' }]);
    getCount();
  }, [setBreadcrumbs]);

  return (
    <div className="w-full p-4 bg-white rounded-md shadow-sm h-fit ">
      <Tabs defaultValue="staff" className="flex flex-1 ">
        <TabsList className="grid grid-cols-2 w-fit">
          <TabsTrigger value="staff">Nhân viên ({staff})</TabsTrigger>
          <TabsTrigger value="cusstomer">Khách hàng ({customer})</TabsTrigger>
        </TabsList>
        <TabsContent value="staff">
          <StaffTable onDeleteSuccess={() => setStaff((prev) => prev - 1)}></StaffTable>
        </TabsContent>
        <TabsContent value="cusstomer">
          <CustomerTable></CustomerTable>
        </TabsContent>
      </Tabs>
    </div>
  );
}
