'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

import api from '@/lib/axios';
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
import ProductPromotionForm from '@/components/promotions/product/ProductPromotionForm';
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
    if (!id) return;
    if (!authData.userId) return;
    try {
      setIsSubmitting(true);
      const apiData = mapProductPromotionDetailToDto(data, authData.userId);
      await api.put(`/promotions/${id}`, apiData);
      toast.success('Cập nhật thành công!');
      router.back();
    } catch (error) {
      console.error(error);
      toast.error('Cập nhật thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  }

  const [data, setData] = useState<ProductPromotionDetail>();
  const [products, setProducts] = useState<ProductOverView[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [activityLogs, setActivityLogs] = useState<ActivityLogs[]>([]);

  async function fetchData() {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/promotions/${id}`);

      const { data, products, activityLogs } = mapProductPromotionDetailFromDto(res.data);
      setData(data);
      setProducts(products);
      setActivityLogs(activityLogs);
    } catch (error) {
      console.error(error);
      toast.error('Không tìm thấy khuyến mãi!');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!id) return;
    if (!authData.userId) return;

    const now = new Date();
    const start = data?.from;

    if (start && start <= now) {
      toast.error('Không thể xoá vì khuyến mãi đã hoặc đang diễn ra!');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.delete(`/promotions/${id}`);
      toast.success('Xoá khuyến mãi thành công!');
      router.back();
    } catch (error) {
      console.error(error);
      toast.error('Xoá khuyến mãi thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [id]);

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
            isViewing={!!data?.from && data.from < new Date()}
            onDelete={onDelete}
          />
          {authData.role && authData.userId && authData.role === 1 && (
            <div className=" absolute top-6 right-6">
              <ActionHistorySheet activityLogs={activityLogs} />
            </div>
          )}
        </div>

        {isSubmitting && <Loader />}
      </div>
    </div>
  );
}
