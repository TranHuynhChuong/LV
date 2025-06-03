'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CategoryForm, { CategoryFormData } from '../components/categoryForm';
import api from '@/lib/axiosClient';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useAuth } from '@/contexts/AuthContext';
import Loading from './loading';
import { ActionHistorySheet } from '@/components/ActivityLogSheet';
import { ActivityLog } from '@/type/ActivityLog';
import { Metadata } from '@/type/Metadata';

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { authData } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<CategoryFormData | null>(null);

  const [metadata, setMetadata] = useState<Metadata[]>([]);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Danh mục', href: '/category' },
      { label: 'Chi tiết thể loại' },
    ]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    if (!id) return;

    api
      .get(`/categories/${id}`)
      .then((res) => {
        const data = res.data;

        setInitialData({
          id: data.TL_id,
          name: data.TL_ten,
          parentId: data.TL_idTL ?? null,
        });

        const metadataFormatted =
          data.lichSuThaoTac?.map((item: ActivityLog) => ({
            time: item.thoiGian,
            action: item.thaoTac,
            user: {
              id: item.nhanVien?.NV_id,
              name: item.nhanVien?.NV_hoTen,
              phone: item.nhanVien?.NV_soDienThoai,
              email: item.nhanVien?.NV_email,
            },
          })) ?? [];
        setMetadata(metadataFormatted);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Không tìm thấy thể loại!');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = (data: { name: string; id?: number | null; parentId?: number | null }) => {
    const apiData = {
      TL_ten: data.name,
      TL_idTL: data.parentId ?? null,
      NV_id: authData.userId,
    };

    // Use data.id if available, otherwise fallback to the id from params
    const categoryId = data.id ?? id;
    console.log(apiData);
    api
      .put(`/categories/${categoryId}`, apiData)
      .then(() => {
        toast.success('Cập nhật thành công');
        router.back();
      })
      .catch((error) => {
        if (error.status === 400) {
          toast.error('Cập nhật thất bại!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
        console.error(error);
      });
  };

  const handleDelete = () => {
    api
      .delete(`/categories/${id}`)
      .then((res) => {
        toast.success(res.data.message ?? 'Xóa thành công');
        router.back();
      })
      .catch((error) => {
        if (error.status === 400) {
          toast.error('Xóa thất bại!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
        console.error(error);
      });
  };

  if (loading) return <Loading />;
  if (!initialData) return <Loading />;

  return (
    <div className="relative w-full max-w-xl h-fit min-w-md">
      <CategoryForm onSubmit={handleSubmit} onDelete={handleDelete} defaultValues={initialData} />
      <ActionHistorySheet metadata={metadata} />
    </div>
  );
}
