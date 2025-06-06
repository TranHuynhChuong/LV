'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/axiosClient';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CategoryForm, { CategoryFormData } from '../components/categoryForm';

export default function NewCategory() {
  const router = useRouter();
  const { authData } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Danh mục', href: '/categories' },
      { label: 'Thêm mới thể loại' },
    ]);
  }, [setBreadcrumbs]);
  const handleSubmit = (data: CategoryFormData) => {
    const apiData = {
      TL_ten: data.name ?? '',
      TL_idTL: data.parentId ?? null,
      NV_id: authData.userId,
    };

    console.log('Submitting category data:', apiData);
    api
      .post('/categories', apiData)
      .then(() => {
        toast.success('Thêm mới thành công');
        router.back();
      })
      .catch((error) => {
        console.error(error);
        if (error.status === 400) {
          toast.error('Thêm mới thất bại!');
        } else if (error.status === 409) {
          toast.error('Thể loại đã tồn tại!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
      });
  };

  return (
    <div className="w-full max-w-2xl h-fit min-w-fit xl:max-w-4xl mx-auto">
      <CategoryForm onSubmit={handleSubmit}></CategoryForm>
    </div>
  );
}
