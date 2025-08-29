'use client';

import Loader from '@/components/utils/loader';
import { useAuth } from '@/contexts/auth-context';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import { Book } from '@/models/book';
import { Promotion } from '@/models/promotion';
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
  const [data, setData] = useState<Promotion>();
  const [books, setBooks] = useState<Book[]>([]);

  const getData = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get(`/promotions/${id}`);
      const { books, ...data } = res.data;
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

  async function onSubmit(data: Promotion) {
    if (!id) return;
    if (!authData.userId) return;
    try {
      setIsSubmitting(true);
      const apiData = { ...data, staffId: authData.userId };
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
    const start = data?.startDate;

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
            dataSelected={books}
            isViewing={!!data?.startDate && data.startDate < new Date()}
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
