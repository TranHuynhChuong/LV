'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ProductReviewForm from '@/components/reviews/reviewForm';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { Order, mapOrderFromDto } from '@/models/orders';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import Loader from '@/components/utils/Loader';

interface ProductReviewInput {
  productId: number;
  productName: string;
  productImage: string;
}

interface ReviewState {
  rating: number;
  content: string;
}

export function mapOrderToReviewInputs(order: Order): ProductReviewInput[] {
  return order.orderDetails.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    productImage: item.productImage,
  }));
}

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { authData } = useAuth();
  const [data, setData] = useState<Order>();
  const [reviews, setReviews] = useState<Record<number, ReviewState>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(
    async (id: string) => {
      try {
        const res = await api.get(`orders/${id}`);
        const mapped = await mapOrderFromDto(res.data);
        setData(mapped);
      } catch (error) {
        console.error(error);
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
      reviewInputs.reduce((acc, p) => {
        acc[p.productId] = { rating: 5, content: '' };
        return acc;
      }, {} as Record<number, ReviewState>)
    );
  }, [reviewInputs]);

  const handleChange = useCallback((productId: number, rating: number, content: string) => {
    setReviews((prev) => ({
      ...prev,
      [productId]: { rating, content },
    }));
  }, []);

  const handleSubmit = async () => {
    if (!data || !authData.userId) return;

    const payload = Object.entries(reviews).map(([productId, { rating, content }]) => ({
      DH_id: data.orderId,
      KH_id: authData.userId,
      SP_id: Number(productId),
      DG_diem: rating,
      DG_noiDung: content,
    }));

    try {
      setIsSubmitting(true);
      await api.post(`/reviews`, payload);

      toast.success('Gửi đánh giá thành công!');
      router.push('/profile/orders');
    } catch (error) {
      console.error(error);
      toast.error('Gửi đánh giá thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-4 p-4 bg-white rounded-md border">
      {isSubmitting && <Loader />}
      <h2 className="text-lg font-semibold">Đánh giá đơn hàng</h2>

      {reviewInputs.map((p) => (
        <ProductReviewForm
          key={p.productId}
          productImage={p.productImage}
          productName={p.productName}
          initialRating={reviews[p.productId]?.rating ?? 5}
          initialContent={reviews[p.productId]?.content ?? ''}
          onChange={(rating, content) => handleChange(p.productId, rating, content)}
        />
      ))}

      <div className="text-right pt-2 space-x-2">
        <Button onClick={() => router.back()} className="cursor-pointer">
          Hủy
        </Button>
        <Button onClick={handleSubmit} className="cursor-pointer">
          Gửi đánh giá
        </Button>
      </div>
    </div>
  );
}
