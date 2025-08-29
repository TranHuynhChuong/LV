'use client';

import type { BookFormValues } from '@/components/books/book-form';
import Loader from '@/components/utils/loader';
import { useAuth } from '@/contexts/auth-context';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import { Book, Image } from '@/models/book';
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
    const appendIfValid = (
      key: string,
      value: number | string | File | number[] | undefined | null
    ) => {
      if (value === undefined || value === null || value === '') return;

      if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    };

    appendIfValid('title', values.title);
    appendIfValid('status', values.status);
    appendIfValid('summary', values.summary);
    appendIfValid('description', values.description);
    appendIfValid('author', values.author);
    appendIfValid('publisher', values.publisher);
    appendIfValid('isbn', values.isbn);
    appendIfValid('language', values.language);
    appendIfValid('translator', values.translator);
    appendIfValid('size', values.size);
    appendIfValid('publishYear', values.publishYear);
    appendIfValid('page', values.page);
    appendIfValid('sellingPrice', values.sellingPrice);
    appendIfValid('inventory', values.inventory);
    appendIfValid('importPrice', values.importPrice);
    appendIfValid('weight', values.weight);

    if (values.categoryIds?.length) {
      formData.append('categoryIds', JSON.stringify(values.categoryIds));
    }

    appendIfValid('staffId', authData.userId);

    if (values.imageFiles?.length) {
      values.imageFiles.forEach((file) => {
        formData.append('imageFiles', file);
      });
    }

    const imagesToDelete = Array.isArray(data?.images)
      ? data.images.filter((img: Image) => !images?.includes(img.url))
      : [];

    if (values.coverImageFile) {
      formData.append('coverImageFile', values.coverImageFile);
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

  const [data, setData] = useState<Book>();

  const getData = useCallback(
    async (id: string) => {
      if (!id) return;
      try {
        const res = await api.get(`/books/${id}`);
        const book = res.data;
        setData(book);
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
