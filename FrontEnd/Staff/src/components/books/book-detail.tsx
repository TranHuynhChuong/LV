'use client';

import type { BookFormType, BookFormValues } from '@/components/books/book-form';

import Loader from '@/components/utils/loader';
import { useAuth } from '@/contexts/auth-context';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import { ImageDto } from '@/models/books';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import BookFormLoading from './book-form-loading';
import { ActionHistorySheet } from '../utils/activitylog-sheet-dynamic-import';
import BookForm from '@/components/books/book-form';

export default function BookDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Sách', href: '/books' },
      { label: 'Chi tiết sách' },
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

      toast.success('Cập nhật thành công');
      router.back();
    } catch {
      toast.error('Cập nhật thất bại!');
      setIsSubmitting(false);
    }
  }

  const [data, setData] = useState<BookFormType>();
  const getCoverImageUrl = (images: ImageDto[]): string => {
    const cover = images.find((img) => img.A_anhBia);
    return cover ? cover.A_url : '';
  };
  const getBookImageUrls = (images: ImageDto[]): string[] => {
    return images.filter((img) => !img.A_anhBia).map((img) => img.A_url);
  };
  const getData = useCallback(
    async (id: string) => {
      if (!id) return;
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
      } catch {
        toast.error('Không tìm thấy sách!');
        router.back();
      }
    },
    [router]
  );

  useEffect(() => {
    getData(id);
  }, [id, getData]);

  async function handleOnDelete() {
    if (!authData.userId) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/books/${id}?staffId=${authData.userId}`);
      toast.success('Xóa thành công');
      router.back();
    } catch {
      toast.error('Xóa thất bại!');
      setIsSubmitting(false);
    }
  }
  if (!data) return <BookFormLoading />;
  else
    return (
      <div>
        {isSubmitting && <Loader />}
        <BookForm
          onSubmit={onSubmit}
          defaultValue={data}
          onDelete={data?.status === 'An' ? handleOnDelete : undefined}
        />
        <div className="absolute top-6 right-6">
          <ActionHistorySheet dataName="Sach" dataId={id} />
        </div>
      </div>
    );
}
