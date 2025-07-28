'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/axios-client';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import EventBus from '@/lib/event-bus';
import Loader from '@/components/utils/loader';
import { Category, mapCategoryToDto } from '@/models/categories';
import CategoryForm from '@/components/category/category-form';

export default function CategoryNew() {
  const router = useRouter();
  const { authData } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Thể loại', href: '/categories' },
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
      EventBus.emit('category:refetch');
      router.back();
    } catch {
      toast.error('Thêm mới thất bại!');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-2xl p-4 mx-auto h-fit min-w-fit xl:max-w-4xl">
      {isSubmitting && <Loader />}
      <CategoryForm onSubmit={handleSubmit}></CategoryForm>
    </div>
  );
}
