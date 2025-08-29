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
