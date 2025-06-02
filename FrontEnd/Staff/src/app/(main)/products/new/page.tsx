'use client';

import { useEffect } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import ProductForm, { Product, ProductFormValues } from '../components/productForm';
import api from '@/lib/axiosClient';

export default function Products() {
  const { setBreadcrumbs } = useBreadcrumb();

  const Product = {
    name: 'Áo thun nam cổ tròn',
    summary: 'Áo thun chất liệu cotton thoáng mát, phù hợp mặc hàng ngày.',
    category: [3],
    description: 'Áo thun nam cổ tròn, màu trắng tinh tế, co giãn 4 chiều, đường may chắc chắn.',
    attributes: [
      { key: 'Chất liệu', value: 'Cotton 100%' },
      { key: 'Màu sắc', value: 'Trắng' },
      { key: 'Kích thước', value: 'M, L, XL' },
    ],
    price: 199000,
    author: 'string',
    publisher: 'string',
    publishYear: 2015,
    page: 3,
    isbn: 'string',
    language: 'string',
    translator: 'string',
    stock: 120,
    cost: 95000,
    weight: 0.3, // tính bằng kg
    coverImage: 'https://picsum.photos/seed/1/200/200',
    productImages: [
      'https://picsum.photos/seed/2/200/200',
      'https://picsum.photos/seed/3/200/200',
      'https://picsum.photos/seed/4/200/200',
    ],
  } as Product;

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Sản phẩm', href: '/products' },
      { label: 'Thêm mới sản phẩm' },
    ]);
  }, [setBreadcrumbs]);

  const onSubmit = (values: ProductFormValues, coverImage?: string, productImages?: string[]) => {
    // Ảnh gốc từ defaultValue (Product)
    const originalCover = Product.coverImage;
    const originalImages = Product.productImages || [];

    // 1. Kiểm tra coverImage có thay đổi không
    const isCoverImageChanged = coverImage !== originalCover;

    // 2. Ảnh productImages bị xóa (có trong gốc mà không có trong mới)
    const deletedImages = originalImages.filter((img) => !(productImages || []).includes(img));

    // 3. Ảnh productImages mới thêm vào (có trong mới mà không có trong gốc)
    const addedImages = (productImages || []).filter((img) => !originalImages.includes(img));

    console.log('Cover image changed:', isCoverImageChanged);
    console.log('Deleted images:', deletedImages);
    console.log('Added images:', addedImages);
    console.log('Submitted values:', values);
    submitProductForm(values, isCoverImageChanged, deletedImages);
  };

  async function submitProductForm(
    values: ProductFormValues,
    isCoverImageChanged?: boolean,
    deletedImages?: string[]
  ) {
    try {
      const formData = new FormData();

      // Thêm các trường thông thường nếu có giá trị
      if (values.name) formData.append('SP_ten', values.name);
      if (values.summary) formData.append('SP_moTa', values.summary);
      if (values.description) formData.append('description', values.description);
      if (values.category) formData.append('SP_theLoai', JSON.stringify(values.category));
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

      // Thêm file coverImageFile nếu có
      if (values.coverImageFile) {
        formData.append('coverImageFile', values.coverImageFile);
      }

      // Thêm các file productImageFiles nếu có
      if (values.productImageFiles && values.productImageFiles.length > 0) {
        values.productImageFiles.forEach((file) => {
          formData.append('productImageFiles', file);
        });
      }

      if (isCoverImageChanged) {
        formData.append('isCoverImageChanged', 'true');
      }

      if (deletedImages && deletedImages.length > 0) {
        formData.append('deleteImages', JSON.stringify(deletedImages));
      }

      const response = await api.post('/categories/test', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data;
    } catch (error) {
      console.error('Submit error:', error);
      throw error;
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto lg:max-w-4xl min-w-fit h-fit">
      <ProductForm onSubmit={onSubmit} />
    </div>
  );
}
