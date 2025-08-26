'use client';

import Loader from '@/components/utils/loader';
import { useAuth } from '@/contexts/auth-context';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import { BookOverView } from '@/models/books';
import type { BookPromotionDetail } from '@/models/promotionBook';
import { mapBookPromotionDetailFromDto, mapBookPromotionDetailToDto } from '@/models/promotionBook';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import BookPromotionFormLoading from './book-promotion-form-loading';
import BookPromotionForm from './book-promotion-form';
import { ActionHistorySheet } from '@/components/utils/activitylog-sheet-dynamic-import';

export default function BookPromotionDetail() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Giảm giá sách', href: '/promotions/books' },
      { label: 'Chi tiết' },
    ]);
  }, [setBreadcrumbs]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<BookPromotionDetail>();
  const [books, setBooks] = useState<BookOverView[]>([]);

  const getData = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get(`/promotions/${id}`);
      const { data, books } = mapBookPromotionDetailFromDto(res.data);
      setData(data);
      setBooks(books);
    } catch {
      toast.error('Không tìm thấy khuyến mãi!');
      router.back();
    }
  }, [id, router]);

  useEffect(() => {
    getData();
  }, [getData]);

  async function onSubmit(data: BookPromotionDetail) {
    if (!id) return;
    if (!authData.userId) return;
    try {
      setIsSubmitting(true);
      const apiData = mapBookPromotionDetailToDto(data, authData.userId);
      await api.put(`/promotions/${id}`, apiData);
      toast.success('Cập nhật thành công');
      router.back();
    } catch {
      toast.error('Cập nhật thất bại!');
      setIsSubmitting(false);
    }
  }

  async function onDelete() {
    if (!id) return;
    if (!authData.userId) return;

    const now = new Date();
    const start = data?.from;

    if (start && start <= now) {
      toast.error('Không thể xoá vì khuyến mãi đã hoặc đang diễn ra!');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.delete(`/promotions/${id}`);
      toast.success('Xoá khuyến mãi thành công!');
      router.back();
    } catch {
      toast.error('Xoá khuyến mãi thất bại!');
      setIsSubmitting(false);
    }
  }
  if (!data) return <BookPromotionFormLoading />;
  else
    return (
      <>
        <div className="relative ">
          <BookPromotionForm
            onSubmit={onSubmit}
            defaultValues={data}
            availableBooks={books}
            isViewing={!!data?.from && data.from < new Date()}
            onDelete={onDelete}
          />
          <div className="absolute top-6 right-6">
            <ActionHistorySheet dataName="KhuyenMai" dataId={id} />
          </div>
        </div>

        {isSubmitting && <Loader />}
      </>
    );
}
