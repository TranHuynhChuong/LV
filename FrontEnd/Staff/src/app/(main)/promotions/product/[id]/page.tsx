'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

import api from '@/lib/axiosClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import Loader from '@/components/utils/Loader';
import Loading from './loading';
import {
  mapProductPromotionDetailFromDto,
  mapProductPromotionDetailToDto,
} from '@/models/promotionProduct';
import type { ProductPromotionDetail } from '@/models/promotionProduct';
import { ProductOverView } from '@/models/products';
import { ActivityLogs } from '@/models/activityLogs';
import ProductPromotionForm from '@/components/Promotions/Product/ProductPromotionForm';
import { ActionHistorySheet } from '@/components/utils/ActivityLogSheet';

export default function ProductPromotionDetail() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Giảm giá sản phẩm', href: '/promotions/product' },
      { label: 'Chi tiết' },
    ]);
  }, [setBreadcrumbs]);

  async function onSubmit(data: ProductPromotionDetail) {
    try {
      if (!authData.userId) return;
      setIsSubmitting(true);
      const apiData = mapProductPromotionDetailToDto(data, authData.userId);
      await api.post('/promotions', apiData);
      toast.success('Thêm mới thành công!');
      router.back();
    } catch (error) {
      console.error(error);
      toast.error('Thêm mới thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  }

  const [data, setData] = useState<ProductPromotionDetail>();
  const [products, setProducts] = useState<ProductOverView[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [activityLogs, setActivityLogs] = useState<ActivityLogs[]>([]);

  async function fetchData() {
    try {
      const res = await api.get(`/promotions/${id}`);
      const { data, products, activityLogs } = mapProductPromotionDetailFromDto(res.data);
      setData(data);
      setProducts(products);
      setActivityLogs(activityLogs);
    } catch (error) {
      console.error(error);
      toast.error('Không tìm thấy sản phẩm!');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="p-4">
        <div className="w-full max-w-6xl p-4 mx-auto ">
          <Loading />
        </div>
      </div>
    );

  return (
    <div className="p-4">
      <div className="w-full max-w-6xl  mx-auto ">
        <div className="relative ">
          <ProductPromotionForm
            onSubmit={onSubmit}
            defaultValues={data}
            availableProducts={products}
          />
          <ActionHistorySheet activityLogs={activityLogs} />
        </div>

        {isSubmitting && <Loader />}
      </div>
    </div>
  );
}
