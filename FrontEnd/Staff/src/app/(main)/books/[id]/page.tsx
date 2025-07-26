'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import BookForm, { BookFormValues, BookFormType } from '@/components/books/book-form';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { ActionHistorySheet } from '@/components/utils/activitylog-sheet';

import Loader from '@/components/utils/loader';
import Loading from '@/components/books/book-form-loading';
import { ActivityLogs, mapActivityLogsFromDto } from '@/models/activityLogs';
import { ImageDto } from '@/models/books';

export default function Page() {
  const params = useParams();
  const id = params?.id as string;
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Sản phẩm', href: '/books' },
      { label: 'Chi tiết sản phẩm' },
    ]);
  }, [setBreadcrumbs]);

  async function onSubmit(values: BookFormValues, images?: string[]) {
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
    if (values.imageFiles?.length) {
      values.imageFiles.forEach((file) => {
        formData.append('imageFiles', file);
      });
    }
    const imagesToDelete = (data?.images ?? []).filter((url) => !images?.includes(url));

    if (values.coverImageFile) {
      formData.append('coverImageFile', values.coverImageFile);
      imagesToDelete.push(data?.coverImage ?? '');
    }

    if (imagesToDelete.length > 0) {
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    }

    try {
      setIsSubmitting(true);
      await api.put(`/books/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Cập nhật thành công!');
      router.back();
    } catch (error) {
      toast.error('Cập nhật thất bại!');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const [data, setData] = useState<BookFormType>();
  const [loading, setLoading] = useState<boolean>(false);

  const getCoverImageUrl = (images: ImageDto[]): string => {
    const cover = images.find((img) => img.A_anhBia);
    return cover ? cover.A_url : '';
  };

  const getBookImageUrls = (images: ImageDto[]): string[] => {
    return images.filter((img) => !img.A_anhBia).map((img) => img.A_url);
  };

  const [activityLogs, setActivityLogs] = useState<ActivityLogs[]>([]);

  async function fetchData(id: string) {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/books/${id}`);
      const book = res.data;
      const mapped: BookFormType = {
        name: book.S_ten,
        category: book.TL_id,
        status: book.S_trangThai,
        summary: book.S_tomTat,
        description: book.S_moTa,
        author: book.S_tacGia,
        publisher: book.S_nhaXuatBan,
        publishYear: book.S_namXuatBan,
        size: book.S_kichThuoc,
        page: book.S_soTrang,
        isbn: book.S_isbn,
        language: book.S_ngonNgu,
        translator: book.S_nguoiDich,
        salePrice: book.S_giaBan,
        costPrice: book.S_giaNhap,
        inventory: book.S_tonKho,
        weight: book.S_trongLuong,
        coverImage: getCoverImageUrl(book.S_anh),
        images: getBookImageUrls(book.S_anh),
      };
      setData(mapped);

      const metadataFormatted = mapActivityLogsFromDto(book.lichSuThaoTac);
      setActivityLogs(metadataFormatted);
    } catch (error) {
      console.error(error);
      toast.error('Không tìm thấy sản phẩm!');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(id);
  }, [id]);

  async function handleOnDelete() {
    if (!authData.userId) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/books/${id}?staffId=${authData.userId}`);
      toast.success('Xóa thành công!');
      router.back();
    } catch (error) {
      toast.error('Xóa thất bại!');
      console.error('Lỗi khi xóa:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

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
        <BookForm
          onSubmit={onSubmit}
          defaultValue={data}
          onDelete={data?.status === 'An' ? handleOnDelete : undefined}
        />
        {authData.role && authData.userId && authData.role === 1 && (
          <div className=" absolute top-6 right-6">
            <ActionHistorySheet activityLogs={activityLogs} />
          </div>
        )}
      </div>
    </div>
  );
}
