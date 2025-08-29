'use client';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/axios-client';
import { Review } from '@/models/review';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import PaginationControls from '../utils/pagination-controls';
import Image from 'next/image';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale/vi';

export default function ReviewUserList() {
  const [data, setData] = useState<Review[]>([]);
  const { authData } = useAuth();
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pageNumbers, setPageNumbers] = useState<number[]>([1]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = 12;
  useEffect(() => {
    async function getData() {
      try {
        if (!authData.userId) return null;
        const res = await api.get(`/reviews/customer/${authData.userId}`, {
          params: { page, limit },
        });
        const { data, paginationInfo } = res.data;
        setData(data);
        setPageNumbers(paginationInfo.pageNumbers);
        setTotalPages(paginationInfo.totalPages);
        setTotalItems(paginationInfo.totalItems);
      } catch {
        setData([]);
        setPageNumbers([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    }

    getData();
  }, [authData.userId, page]);

  const handlePageChange = (targetPage: number) => {
    const search = new URLSearchParams(searchParams.toString());
    search.set('page', targetPage.toString());
    router.push(`/profile/review?${search.toString()}`);
  };

  const toggleExpand = (index: number) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (data.length === 0) {
    return <></>;
  }
  return (
    <div className="rounded-md bg-white border p-6 space-y-2 w-full">
      <h3 className="font-medium text-lg">Đánh giá của tôi ({totalItems})</h3>
      <ul className="list-none grid grid-cols-1 md:grid-cols-2 gap-1">
        {data.map((review, index) => {
          const isExpanded = expanded[index] ?? false;
          return (
            <li key={index} className="p-2 border rounded-sm">
              <div className="flex gap-3">
                <div className="relative w-20 h-20 shrink-0">
                  <Image
                    src={review.image ?? '/icon.png'}
                    alt={review.title ?? 'Ảnh sách'}
                    sizes="80px"
                    fill
                    className="object-cover rounded-sm "
                  />
                </div>
                <div className="space-y-1 ">
                  <p className="text-sm">{review.title}</p>
                  <div className="flex text-xs space-x-2">
                    <p>⭐{review.rating}/5</p>
                    <p>-</p>
                    <p>{format(new Date(review.createAt), 'dd/MM/yyyy', { locale: vi })}</p>
                    <p>-</p>
                    <p>{review.orderId}</p>
                  </div>
                  {review.content && (
                    <div className="flex flex-col">
                      <p
                        className={`text-xs mb-0 text-gray-600 ${
                          !isExpanded ? 'line-clamp-1' : ''
                        }`}
                      >
                        {review.content}
                      </p>
                      {review.content.length > 50 && (
                        <button
                          onClick={() => toggleExpand(index)}
                          className="text-xs text-gray-600 cursor-pointer hover:underline mt-0"
                        >
                          {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-4">
        <PaginationControls
          pageNumbers={pageNumbers}
          totalPages={totalPages}
          currentPage={page}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
