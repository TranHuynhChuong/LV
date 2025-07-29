'use client';

import BookReviewForm from '@/components/review/review-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Loader from '@/components/utils/loader';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/axios-client';
import { Order, mapOrderFromDto } from '@/models/order';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface BookReviewInput {
  bookId: number;
  bookName: string;
  bookImage: string;
}

interface ReviewState {
  rating: number;
  content: string;
}

function mapOrderToReviewInputs(order: Order): BookReviewInput[] {
  return order.orderDetails.map((item) => ({
    bookId: item.bookId,
    bookName: item.bookName,
    bookImage: item.bookImage,
  }));
}

export default function ReviewPanel() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { authData } = useAuth();
  const [data, setData] = useState<Order>();
  const [reviews, setReviews] = useState<Record<number, ReviewState>>({});
  const [openConfirm, setOpenConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(
    async (id: string) => {
      try {
        const res = await api.get(`orders/detail/${id}`);
        const mapped = await mapOrderFromDto(res.data);
        setData(mapped);
      } catch {
        toast.error('Không tìm thấy đơn hàng!');
        router.back();
      }
    },
    [router]
  );

  useEffect(() => {
    if (id) fetchData(id);
  }, [id, fetchData]);

  const reviewInputs = useMemo(() => {
    if (!data) return [];
    return mapOrderToReviewInputs(data);
  }, [data]);

  useEffect(() => {
    if (reviewInputs.length === 0) return;

    setReviews(
      reviewInputs.reduce((acc, b) => {
        acc[b.bookId] = { rating: 5, content: '' };
        return acc;
      }, {} as Record<number, ReviewState>)
    );
  }, [reviewInputs]);

  const handleChange = useCallback((bookId: number, rating: number, content: string) => {
    setReviews((prev) => ({
      ...prev,
      [bookId]: { rating, content },
    }));
  }, []);

  const handleSubmit = async () => {
    if (!data || !authData.userId) return;

    const payload = Object.entries(reviews).map(([bookId, { rating, content }]) => ({
      DH_id: data.orderId,
      KH_id: authData.userId,
      S_id: Number(bookId),
      DG_diem: rating,
      DG_noiDung: content,
    }));

    try {
      setIsSubmitting(true);
      await api.post(`/reviews`, payload);
      toast.success('Gửi đánh giá thành công!');
      router.replace('/profile/order');
    } catch {
      toast.error('Gửi đánh giá thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-4 space-y-4 bg-white border rounded-md">
      {isSubmitting && <Loader />}
      <h2 className="text-lg font-semibold">Đánh giá đơn hàng</h2>
      {reviewInputs.map((b) => (
        <BookReviewForm
          key={b.bookId}
          bookImage={b.bookImage}
          bookName={b.bookName}
          initialRating={reviews[b.bookId]?.rating ?? 5}
          initialContent={reviews[b.bookId]?.content ?? ''}
          onChange={(rating, content) => handleChange(b.bookId, rating, content)}
        />
      ))}

      <div className="pt-2 space-x-2 text-right">
        <Button onClick={() => router.back()} className="cursor-pointer">
          Hủy
        </Button>
        <Button onClick={() => setOpenConfirm(true)} className="cursor-pointer">
          Gửi đánh giá
        </Button>
      </div>
      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận gửi đánh giá</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn gửi đánh giá này? Sau khi gửi sẽ không thể chỉnh sửa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenConfirm(false)}>
              Hủy
            </Button>
            <Button
              variant="default"
              onClick={() => {
                handleSubmit();
                setOpenConfirm(false);
              }}
            >
              Gửi đánh giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
