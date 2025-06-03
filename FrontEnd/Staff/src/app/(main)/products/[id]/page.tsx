'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import ProductForm, { ProductFormValues, ProductFormType } from '../components/productForm';
import api from '@/lib/axiosClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ActionHistorySheet } from '@/components/ActivityLogSheet';
import { ActivityLog } from '@/type/ActivityLog';
import { Metadata } from '@/type/Metadata';
import { Image } from '@/type/Image';

export default function ProductDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Sản phẩm', href: '/products' },
      { label: 'Chi tiết sản phẩm' },
    ]);
  }, [setBreadcrumbs]);

  const onSubmit = async (values: ProductFormValues, productImages?: string[]) => {
    const formData = new FormData();
    setIsSubmitting(true);

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

    const imagesToDelete = (data?.productImages ?? []).filter(
      (url) => !productImages?.includes(url)
    );

    if (imagesToDelete.length) {
      // Gửi danh sách url ảnh cần xoá cho backend
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    }

    api
      .post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(() => {
        toast.success('Thêm mới thành công!');
        router.back();
      })
      .catch((error) => {
        if (error?.status === 400) {
          toast.error('Thêm mới thất bại!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
        console.error(error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const [data, setData] = useState<ProductFormType>();
  const [loading, setLoading] = useState<boolean>(false);

  // Helper functions to reduce nesting
  const getCoverImageUrl = (images: Image[]): string => {
    const cover = images.find((img) => img.A_anhBia);
    return cover ? cover.A_url : '';
  };

  const getProductImageUrls = (images: Image[]): string[] => {
    return images.filter((img) => !img.A_anhBia).map((img) => img.A_url);
  };

  const [metadata, setMetadata] = useState<Metadata[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    api
      .get(`/products/${id}`)
      .then((res) => {
        const { product } = res.data;
        const mapped: ProductFormType = {
          name: product.SP_ten,
          category: product.TL_id,
          status: product.SP_trangThai,
          summary: product.SP_tomTat,
          description: product.SP_moTa,
          author: product.SP_tacGia,
          publisher: product.SP_nhaXuatBan,
          publishYear: product.SP_namXuatBan,
          page: product.SP_soTrang,
          isbn: product.SP_isbn,
          language: product.SP_ngonNgu,
          translator: product.SP_nguoiDich,
          price: product.SP_giaBan,
          cost: product.SP_giaNhap,
          stock: product.SP_tonKho,
          weight: product.SP_trongLuong,
          coverImage: getCoverImageUrl(product.SP_anh),
          productImages: getProductImageUrls(product.SP_anh),
        };
        setData(mapped);

        const metadataFormatted =
          product.lichSuThaoTac?.map((item: ActivityLog) => ({
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
        toast.error('Không tìm thấy sản phẩm!');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <></>;

  return (
    <div className="relative w-full max-w-2xl mx-auto lg:max-w-4xl min-w-fit h-fit">
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      )}
      <ProductForm onSubmit={onSubmit} defaultValue={data} />
      <ActionHistorySheet metadata={metadata} />
    </div>
  );
}
