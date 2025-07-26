'use client';

import BookImages from '@/components/book/book-images';
import BookInfo from '@/components/book/book-inf';
import { BookList } from '@/components/book/book-list';
import ReviewsSection from '@/components/review/review-section';
import api from '@/lib/axios';
import eventBus from '@/lib/event-bus';
import type { BookDetail } from '@/models/book';
import { mapBookDetailFormDto } from '@/models/book';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import Loading from '../loading';

export default function BookDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.bookId as string;
  const [data, setData] = useState<BookDetail>();

  const fetchBookDetail = useCallback(async () => {
    if (!id) return;

    const params = {
      mode: 'full',
    };

    try {
      const res = await api.get(`/books/${id}`, { params });
      const book = res.data;
      setData(mapBookDetailFormDto(book));
    } catch {
      toast.error('Không tìm thấy sản phẩm!');
      router.replace('/');
    }
  }, [id, router]);

  useEffect(() => {
    fetchBookDetail();
  }, [fetchBookDetail]);

  useEffect(() => {
    const handler = () => {
      fetchBookDetail();
    };
    eventBus.on('reloadBook', handler);
    return () => eventBus.off('reloadBook', handler);
  }, [fetchBookDetail]);

  if (!data) {
    return <Loading />;
  }

  return (
    <div className="space-y-4 ">
      <div className="relative flex flex-col gap-4 lg:flex-row">
        <div className="basis-0 flex-[5] w-full lg:max-w-lg">
          <div className="sticky z-40 top-4">
            <div className=" min-w-86 h-124">
              <BookImages images={data.images} />
            </div>
          </div>
        </div>

        <div className="basis-0 flex-[7] w-full space-y-4">
          <BookInfo data={data} />
        </div>
      </div>
      <div className="w-full p-4 bg-white rounded-md shadow">
        <ReviewsSection bookId={data.id} rating={data.rating} />
      </div>

      <div className="w-full p-4 bg-white rounded-md shadow">
        <h2 className="mb-4 text-lg font-semibold">Gợi ý tương tự</h2>
        <BookList displayType="carousel" books={data.similar} />
      </div>
    </div>
  );
}
