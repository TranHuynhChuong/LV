'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useAuth } from '@/contexts/AuthContext';
import Loading from './loading';
import { ActionHistorySheet } from '@/components/utils/ActivityLogSheet';

import Loader from '@/components/utils/Loader';
import { Category, mapCategoryToDto } from '@/models/categories';
import CategoryForm from '@/components/categories/categoryForm';
import { ActivityLogs, mapActivityLogsFromDto } from '@/models/activityLogs';

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { authData } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Category>();

  const [activityLogs, setActivityLogs] = useState<ActivityLogs[]>([]);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Danh mục', href: '/category' },
      { label: 'Chi tiết thể loại' },
    ]);
  }, [setBreadcrumbs]);

  async function fetchCategory() {
    setLoading(true);
    try {
      const res = await api.get(`/categories/${id}`);
      const data = res.data;

      setInitialData({
        id: data.TL_id,
        name: data.TL_ten,
        parentId: data.TL_idTL ?? null,
      });
      setActivityLogs(mapActivityLogsFromDto(data.lichSuThaoTac));
    } catch (error) {
      console.error(error);
      toast.error('Không tìm thấy thể loại!');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;

    fetchCategory();
  }, []);

  async function handleSubmit(data: Category) {
    if (!authData.userId) return;
    const apiData = mapCategoryToDto(data, authData.userId);

    setIsSubmitting(true);

    try {
      await api.put(`/categories/${id}`, apiData);
      toast.success('Cập nhật thành công');
      router.back();
    } catch (error) {
      toast.error('Cập nhật thất bại!');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDelete = () => {
    setIsSubmitting(true);
    if (!authData.userId) return;
    api
      .delete(`/categories/${id}?staffId=${authData.userId}`)
      .then((res) => {
        toast.success(res.data.message ?? 'Xóa thành công');
        router.back();
      })
      .catch((error) => {
        if (error.status === 400) {
          toast.error('Xóa thất bại!');
        } else if (error.status === 409) {
          toast.error('Không thể xóa do ràng buộc dữ liệu!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
        console.error(error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (loading)
    return (
      <div className="p-4">
        <div className="relative w-full max-w-xl mx-auto h-fit min-w-md">
          <Loading />
        </div>
      </div>
    );

  return (
    <div className="p-4">
      <div className="relative w-full max-w-xl mx-auto h-fit min-w-md">
        {isSubmitting && <Loader />}
        <CategoryForm onSubmit={handleSubmit} onDelete={handleDelete} defaultValues={initialData} />
        <div className=" absolute top-6 right-6">
          <ActionHistorySheet activityLogs={activityLogs} />
        </div>
      </div>
    </div>
  );
}
