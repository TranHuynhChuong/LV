'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';

import api from '@/lib/axios';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import Loader from '@/components/utils/loader';
import Loading from './loading';
import { mapBookPromotionDetailFromDto, mapBookPromotionDetailToDto } from '@/models/promotionBook';
import type { BookPromotionDetail } from '@/models/promotionBook';
import { BookOverView } from '@/models/books';
import { ActivityLogs } from '@/models/activityLogs';
import BookPromotionForm from '@/components/promotions/book/book-promotion-form';
import { ActionHistorySheet } from '@/components/utils/activitylog-sheet';

export default function Page() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Giảm giá sách', href: '/promotions/books' },
      { label: 'Chi tiết' },
    ]);
  }, [setBreadcrumbs]);

  async function onSubmit(data: BookPromotionDetail) {
    if (!id) return;
    if (!authData.userId) return;
    try {
      setIsSubmitting(true);
      const apiData = mapBookPromotionDetailToDto(data, authData.userId);
      await api.put(`/promotions/${id}`, apiData);
      toast.success('Cập nhật thành công!');
      router.back();
    } catch (error) {
      console.error(error);
      toast.error('Cập nhật thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  }

  const [data, setData] = useState<BookPromotionDetail>();
  const [books, setBooks] = useState<BookOverView[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [activityLogs, setActivityLogs] = useState<ActivityLogs[]>([]);

  async function fetchData() {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/promotions/${id}`);

      const { data, books, activityLogs } = mapBookPromotionDetailFromDto(res.data);
      setData(data);
      setBooks(books);
      setActivityLogs(activityLogs);
    } catch (error) {
      console.error(error);
      toast.error('Không tìm thấy khuyến mãi!');
      router.back();
    } finally {
      setLoading(false);
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
    } catch (error) {
      console.error(error);
      toast.error('Xoá khuyến mãi thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="p-4">
        <div className="w-full max-w-6xl p-4 mx-auto ">
          <Loading />
        </div>
      </div>
    );

  return (
    <div className="p-4">
      <div className="w-full max-w-6xl  mx-auto ">
        <div className="relative ">
          <BookPromotionForm
            onSubmit={onSubmit}
            defaultValues={data}
            availableBooks={books}
            isViewing={!!data?.from && data.from < new Date()}
            onDelete={onDelete}
          />
          {authData.role && authData.userId && authData.role === 1 && (
            <div className=" absolute top-6 right-6">
              <ActionHistorySheet activityLogs={activityLogs} />
            </div>
          )}
        </div>

        {isSubmitting && <Loader />}
      </div>
    </div>
  );
}
