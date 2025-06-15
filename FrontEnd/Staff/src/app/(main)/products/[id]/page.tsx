'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import ProductForm, { ProductFormValues, ProductFormType } from '../components/productForm';
import api from '@/lib/axiosClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ActionHistorySheet } from '@/components/ActivityLogSheet';
import { ActivityLog } from '@/type/ActivityLog';
import { Metadata } from '@/type/Metadata';
import { Image } from '@/type/Image';
import Loader from '@/components/Loader';
import Loading from '../components/productFormLoading';

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

  const onSubmit = (values: ProductFormValues, productImages?: string[]) => {
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
    if (values.productImageFiles?.length) {
      values.productImageFiles.forEach((file) => {
        formData.append('productImageFiles', file);
      });
    }
    const imagesToDelete = (data?.productImages ?? []).filter(
      (url) => !productImages?.includes(url)
    );

    if (values.coverImageFile) {
      formData.append('coverImageFile', values.coverImageFile);
      imagesToDelete.push(data?.coverImage ?? '');
    }

    if (imagesToDelete.length > 0) {
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    }

    api
      .put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(() => {
        toast.success('Cập nhật thành công!');
        router.back();
      })
      .catch((error) => {
        if (error?.status === 400) {
          toast.error('Cập nhật thất bại!');
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

  const getCoverImageUrl = (images: Image[]): string => {
    const cover = images.find((img) => img.A_anhBia);
    return cover ? cover.A_url : '';
  };

  const getProductImageUrls = (images: Image[]): string[] => {
    return images.filter((img) => !img.A_anhBia).map((img) => img.A_url);
  };

  const [metadata, setMetadata] = useState<Metadata[]>([]);

  const fetchData = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${id}`);
      const product = res.data;
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
    } catch (error) {
      console.error(error);
      toast.error('Không tìm thấy sản phẩm!');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchData(id);
  }, [id]);

  const handleOnDelete = () => {
    setIsSubmitting(true);
    api
      .delete(`/products/${id}`)
      .then(() => {
        toast.success('Xóa thành công!');
        router.back();
      })
      .catch((error) => {
        if (error.status === 400) {
          toast.error('Xóa thất bại!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
        console.error('Lỗi khi xóa:', error);
      })
      .finally(() => setLoading(false));
  };

  if (loading)
    return (
      <div className="p-4">
        <div className="relative w-full max-w-4xl  mx-auto  h-fit">
          <Loading />
        </div>
      </div>
    );

  return (
    <div className="p-4">
      <div className="relative w-full max-w-4xl  mx-auto  h-fit">
        {isSubmitting && <Loader />}
        <ProductForm onSubmit={onSubmit} defaultValue={data} onDelete={handleOnDelete} />
        <ActionHistorySheet metadata={metadata} />
      </div>
    </div>
  );
}
