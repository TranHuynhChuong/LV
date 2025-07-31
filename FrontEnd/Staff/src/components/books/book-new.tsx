'use client';

import type { BookFormValues } from '@/components/books/book-form';
import BookForm from '@/components/books/book-form';
import Loader from '@/components/utils/loader';
import { useAuth } from '@/contexts/auth-context';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function BookNew() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Sách', href: '/books' },
      { label: 'Thêm mới sách' },
    ]);
  }, [setBreadcrumbs]);

  async function onSubmit(values: BookFormValues) {
    const formData = new FormData();

    if (values.name) formData.append('S_ten', values.name);
    if (values.status !== undefined && values.status !== null)
      formData.append('S_trangThai', values.status.toString());
    if (values.summary) formData.append('S_tomTat', values.summary);
    if (values.description) formData.append('S_moTa', values.description);
    if (values.category) formData.append('TL_id', JSON.stringify(values.category));
    if (values.author) formData.append('S_tacGia', values.author);
    if (values.publisher) formData.append('S_nhaXuatBan', values.publisher);
    if (values.isbn) formData.append('S_isbn', values.isbn);
    if (values.language) formData.append('S_ngonNgu', values.language);
    if (values.translator) formData.append('S_nguoiDich', values.translator);
    if (values.size) formData.append('S_kichThuoc', values.size);
    if (values.publishYear !== undefined && values.publishYear !== null)
      formData.append('S_namXuatBan', values.publishYear.toString());
    if (values.page !== undefined && values.page !== null)
      formData.append('S_soTrang', values.page.toString());
    if (values.salePrice !== undefined && values.salePrice !== null)
      formData.append('S_giaBan', values.salePrice.toString());
    if (values.inventory !== undefined && values.inventory !== null)
      formData.append('S_tonKho', values.inventory.toString());
    if (values.costPrice !== undefined && values.costPrice !== null)
      formData.append('S_giaNhap', values.costPrice.toString());
    if (values.weight !== undefined && values.weight !== null)
      formData.append('S_trongLuong', values.weight.toString());
    if (authData.userId) formData.append('NV_id', authData.userId);
    if (values.coverImageFile) {
      formData.append('coverImageFile', values.coverImageFile);
    }
    if (values.imageFiles?.length) {
      values.imageFiles.forEach((file) => {
        formData.append('imageFiles', file);
      });
    }

    try {
      setIsSubmitting(true);
      await api.post('/books', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Thêm mới thành công!');
      router.back();
    } catch {
      toast.error('Thêm mới thất bại!');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative w-full max-w-4xl p-4 mx-auto">
      {isSubmitting && <Loader />}
      <BookForm onSubmit={onSubmit} />
    </div>
  );
}
