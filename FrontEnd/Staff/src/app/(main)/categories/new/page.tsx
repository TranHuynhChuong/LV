'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import Loader from '@/components/utils/Loader';
import { Category, mapCategoryToDto } from '@/models/categories';
import CategoryForm from '@/components/categories/categoryForm';

export default function NewCategory() {
  const router = useRouter();
  const { authData } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Danh mục', href: '/categories' },
      { label: 'Thêm mới thể loại' },
    ]);
  }, [setBreadcrumbs]);
  async function handleSubmit(data: Category) {
    if (!authData.userId) return;

    const apiData = mapCategoryToDto(data, authData.userId);
    setIsSubmitting(true);

    try {
      await api.post('/categories', apiData);
      toast.success('Thêm mới thành công');
      router.back();
    } catch (error) {
      console.error('Lỗi khi thêm thể loại:', error);
      toast.error('Thêm mới thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-2xl h-fit min-w-fit xl:max-w-4xl mx-auto p-4">
      {isSubmitting && <Loader />}
      <CategoryForm onSubmit={handleSubmit}></CategoryForm>
    </div>
  );
}
