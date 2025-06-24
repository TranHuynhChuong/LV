'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import ProductForm, { ProductFormValues } from '@/components/products/productForm';
import api from '@/lib/axiosClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Loader from '@/components/utils/Loader';

export default function Products() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Sản phẩm', href: '/products' },
      { label: 'Thêm mới sản phẩm' },
    ]);
  }, [setBreadcrumbs]);

  async function onSubmit(values: ProductFormValues) {
    const formData = new FormData();

    if (values.name) formData.append('SP_ten', values.name);
    if (values.status !== undefined && values.status !== null)
      formData.append('SP_trangThai', values.status.toString());
    if (values.summary) formData.append('SP_tomTat', values.summary);
    if (values.description) formData.append('SP_moTa', values.description);
    if (values.category) formData.append('TL_id', JSON.stringify(values.category));
    if (values.author) formData.append('SP_tacGia', values.author);
    if (values.publisher) formData.append('SP_nhaXuatBan', values.publisher);
    if (values.isbn) formData.append('SP_isbn', values.isbn);
    if (values.language) formData.append('SP_ngonNgu', values.language);
    if (values.translator) formData.append('SP_nguoiDich', values.translator);
    if (values.publishYear !== undefined && values.publishYear !== null)
      formData.append('SP_namXuatBan', values.publishYear.toString());
    if (values.page !== undefined && values.page !== null)
      formData.append('SP_soTrang', values.page.toString());
    if (values.price !== undefined && values.price !== null)
      formData.append('SP_giaBan', values.price.toString());
    if (values.stock !== undefined && values.stock !== null)
      formData.append('SP_tonKho', values.stock.toString());
    if (values.cost !== undefined && values.cost !== null)
      formData.append('SP_giaNhap', values.cost.toString());
    if (values.weight !== undefined && values.weight !== null)
      formData.append('SP_trongLuong', values.weight.toString());
    if (authData.userId) formData.append('NV_id', authData.userId);

    if (values.coverImageFile) {
      formData.append('coverImageFile', values.coverImageFile);
    }

    if (values.productImageFiles?.length) {
      values.productImageFiles.forEach((file) => {
        formData.append('productImageFiles', file);
      });
    }

    try {
      setIsSubmitting(true);
      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Thêm mới thành công!');
      router.back();
    } catch (error) {
      toast.error('Thêm mới thất bại!');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative p-4 max-w-4xl  w-full mx-auto">
      {isSubmitting && <Loader />}
      <ProductForm onSubmit={onSubmit} />
    </div>
  );
}
