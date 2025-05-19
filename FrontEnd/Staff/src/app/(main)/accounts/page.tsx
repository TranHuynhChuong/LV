'use client';

import AuthGuard from '@/components/guard/AuthGuard';
import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/context/BreadcrumbContext';
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
      setStaff(res.data.staff);
      setCustomer(res.data.customer);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Tài khoản' }]);
    getCount();
  }, [setBreadcrumbs]);

  return (
    <AuthGuard allowedRoles={['Admin']}>
      <div className="w-full h-fit bg-white p-4 shadow-sm rounded-md">
        <Tabs defaultValue="staff" className="flex flex-1 ">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="staff">Nhân viên ({staff})</TabsTrigger>
            <TabsTrigger value="cusstomer">Khách hàng ({customer})</TabsTrigger>
          </TabsList>
          <TabsContent value="staff">
            <StaffTable></StaffTable>
          </TabsContent>
          <TabsContent value="cusstomer">
            <CustomerTable></CustomerTable>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
}
