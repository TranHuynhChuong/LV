'use client';

import { useEffect } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { Tabs, TabsTrigger, TabsList, TabsContent } from '@/components/ui/tabs';
import ProductLive from './components/productLive';

export default function Products() {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Sản phẩm' }]);
  }, [setBreadcrumbs]);
  return (
    <div className="w-full p-4 bg-white rounded-md shadow-sm h-fit min-w-fit">
      <Tabs defaultValue="live" className="flex flex-1 ">
        <TabsList className="grid grid-cols-3 w-fit">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="live">Đang hoạt động</TabsTrigger>
          <TabsTrigger value="hidden">Đã ẩn</TabsTrigger>
        </TabsList>
        <TabsContent value="all"></TabsContent>
        <TabsContent value="live">
          <ProductLive></ProductLive>
        </TabsContent>
        <TabsContent value="hidden"></TabsContent>
      </Tabs>
    </div>
  );
}
