'use client';

import { useAuth } from '@/contexts/auth-context';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ActionHistorySheet } from '@/components/utils/activitylog-sheet';
import CategoryForm from '@/components/category/category-form';
import Loader from '@/components/utils/loader';
import { ActivityLogs, mapActivityLogsFromDto } from '@/models/activityLogs';
import { Category, mapCategoryToDto } from '@/models/categories';

export default function CategoryDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { authData } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<Category>();
  const [activityLogs, setActivityLogs] = useState<ActivityLogs[]>([]);
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Thể loại', href: '/categories' },
      { label: 'Chi tiết thể loại' },
    ]);
  }, [setBreadcrumbs]);

  const getData = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get(`/categories/${id}`);
      const data = res.data;

      setData({
        id: data.TL_id,
        name: data.TL_ten,
        parentId: data.TL_idTL ?? null,
      });
      setActivityLogs(mapActivityLogsFromDto(data.lichSuThaoTac));
    } catch {
      toast.error('Không tìm thấy thể loại!');
      router.back();
    }
  }, [id, router]);

  useEffect(() => {
    getData();
  }, [getData]);

  async function handleSubmit(data: Category) {
    if (!authData.userId) return;
    const apiData = mapCategoryToDto(data, authData.userId);

    setIsSubmitting(true);

    try {
      await api.put(`/categories/${id}`, apiData);
      toast.success('Cập nhật thành công');
      router.back();
    } catch {
      toast.error('Cập nhật thất bại!');
      setIsSubmitting(false);
    }
  }

  const handleDelete = () => {
    setIsSubmitting(true);
    if (!authData.userId) return;
    api
      .delete(`/categories/${id}?staffId=${authData.userId}`)
      .then(() => {
        toast.success('Xóa thành công');
        router.back();
      })
      .catch((error) => {
        if (error.status === 409) {
          toast.error('Không thể xóa do ràng buộc dữ liệu!');
        } else {
          toast.error('Xóa thất bại!');
        }
        setIsSubmitting(false);
      });
  };
  if (!data) return null;
  else
    return (
      <div className="p-4">
        <div className="relative w-full max-w-xl mx-auto h-fit min-w-md">
          {isSubmitting && <Loader />}

          <CategoryForm onSubmit={handleSubmit} onDelete={handleDelete} defaultValues={data} />

          <div className="absolute top-6 right-6">
            <ActionHistorySheet activityLogs={activityLogs} />
          </div>
        </div>
      </div>
    );
}
