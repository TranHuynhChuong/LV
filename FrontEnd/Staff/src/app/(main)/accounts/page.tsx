'use client';

import AuthGuard from '@/components/guard/AuthGuard';
import { useEffect } from 'react';
import { useBreadcrumb } from '@/context/BreadcrumbContext';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import StaffTable from './components/staffTable';
import CustomerTable from './components/customerTable';

export default function Accounts() {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Tài khoản' }]);
  }, [setBreadcrumbs]);

  return (
    <AuthGuard allowedRoles={['Admin']}>
      <div className="w-full h-fit bg-white p-4 shadow-sm rounded-md">
        <Tabs defaultValue="staff" className="flex flex-1 ">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="staff">Nhân viên</TabsTrigger>
            <TabsTrigger value="cusstomer">Khách hàng</TabsTrigger>
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
