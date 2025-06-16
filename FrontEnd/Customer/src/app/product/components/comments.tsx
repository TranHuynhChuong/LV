'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';
import api from '@/lib/axiosClient';
import { ApiMetadate } from '@/types/metadata';
import PaginationControls from '@/components/PaginationControls';
import { ProductList } from '@/components/product/productList';

type CommentItemType = {
  content?: string;
  email: string;
  core: number;
  createdAt: string;
};

type CommentProps = {
  id: number;
  score: number;
};

type ApiResponse = {
  data: {
    KH_email: string;
    DG_diem: string;
    DG_ngayTao: Date;
    DH_noiDung?: string;
  }[];
  metadata: ApiMetadate;
  subData: {
    s1: number;
    s2: number;
    s3: number;
    s4: number;
    s5: number;
  };
};

export default function Comment({ id, score }: Readonly<CommentProps>) {
  const [pagination, setPagination] = useState<number[]>([1]);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [comments, setcomments] = useState<CommentItemType[] | []>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [stars, setStars] = useState<{
    s1: number;
    s2: number;
    s3: number;
    s4: number;
    s5: number;
  }>({
    s1: 0,
    s2: 0,
    s3: 0,
    s4: 0,
    s5: 0,
  });

  const pageSize = 6;

  // const fetchData = useCallback(async () => {
  //   try {
  //     const params = {
  //       page: currentPage,
  //       limit: pageSize,
  //     };

  //     const res = await api.get(`/commnents/${id}`, { params });
  //     const ApiResponse: ApiResponse = res.data;
  //     const mapped: CommentItemType[] = ApiResponse.data.map((item) => ({
  //       email: item.KH_email,
  //       core: parseInt(item.DG_diem),
  //       createdAt: item.DG_ngayTao.toString(),
  //       content: item.DH_noiDung,
  //     }));
  //     setcomments(mapped);
  //     setPagination(ApiResponse.metadata.pagination);
  //     setTotalItems(ApiResponse.metadata.totalItems);
  //     setTotalPage(ApiResponse.metadata.totalPage);
  // setStars(ApiResponse.subData);
  //   } catch {
  //     setcomments([]);
  //     setPagination([]);
  //     setTotalItems(0);
  //     setTotalPage(0);
  // setStars({
  //   s1: 0,
  //   s2: 0,
  //   s3: 0,
  //   s4: 0,
  //   s5: 0,
  // });
  //   }
  // }, [currentPage]);

  const fetchData = useCallback(async () => {
    try {
      // === Giả lập dữ liệu đánh giá ===
      const fakeComments = Array.from({ length: 12 }).map((_, i) => ({
        email: `user${i + 1}@example.com`,
        core: Math.floor(Math.random() * 5) + 1, // 1-5 sao
        createdAt: new Date(Date.now() - i * 86400000).toISOString(), // cách mỗi ngày
        content: `Đây là bình luận số ${i + 1}. Sản phẩm rất ${
          i % 2 === 0 ? 'tốt' : 'bình thường'
        }.`,
      }));

      const totalFake = 57;
      const paginated = [3, 4, 5, 6, 7];

      // Gán dữ liệu cho state
      setcomments(fakeComments);
      setPagination(paginated);
      setTotalItems(totalFake);
      setTotalPage(Math.ceil(totalFake / pageSize));
      setStars({
        s1: 33,
        s2: 15,
        s3: 37,
        s4: 12,
        s5: 13,
      });
    } catch {
      setcomments([]);
      setPagination([]);
      setTotalItems(0);
      setTotalPage(0);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (targetPage: number) => {
    setCurrentPage(targetPage);
  };

  const CommentItem = ({ content, email, core, createdAt }: CommentItemType) => {
    const shortEmail = email.split('@')[0];
    const ref = useRef<HTMLDivElement>(null);
    const [showExpand, setShowExpand] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      requestAnimationFrame(() => {
        const clampHeight = el.offsetHeight;
        requestAnimationFrame(() => {
          const fullHeight = el.scrollHeight;
          if (fullHeight > clampHeight) {
            setShowExpand(true);
          }
        });
      });
    }, [content]);

    return (
      <div className="flex ">
        <div className="min-w-28 ld:min-w-32 justify-start space-y-2">
          <p className="text-sm font-medium text-zinc-700">{shortEmail}</p>
          <p className="text-xs text-zinc-500">{new Date(createdAt).toLocaleDateString('vi-VN')}</p>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-1 text-yellow-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} fill={i < core ? 'currentColor' : 'none'} strokeWidth={1} />
            ))}
          </div>

          <div>
            <div
              ref={ref}
              className={`text-sm text-zinc-800 whitespace-pre-line transition-all duration-300 ${
                expanded ? '' : 'line-clamp-3'
              }`}
            >
              {content}
            </div>
            {!expanded && showExpand && (
              <button
                onClick={() => setExpanded(true)}
                className="mt-1 text-xs text-blue-600 hover:underline"
              >
                Xem thêm
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Đánh giá sản phẩm</h3>
      <div className=" p-4 ">
        <div className="flex items-center mb-4 gap-6">
          <div className="flex flex-col items-center gap-1">
            <span>
              <span className="text-4xl">{score}</span>
              <span className="text-lg">/5</span>
            </span>
            <div className="flex items-center gap-0.5 text-yellow-500">
              {Array.from({ length: 5 }).map((_, i) => {
                const starFill =
                  score >= i + 1 ? '100%' : score > i ? `${(score - i) * 100}%` : '0%';

                return (
                  <div key={i} className="relative w-4 h-4">
                    {/* Nền sao viền xám */}
                    <Star size={16} strokeWidth={1} className="absolute top-0 left-0" />
                    {/* Sao màu vàng đè lên */}
                    <div
                      className="absolute top-0 left-0 overflow-hidden z-0"
                      style={{ width: starFill }}
                    >
                      <Star
                        size={16}
                        strokeWidth={1}
                        fill="currentColor"
                        className="text-yellow-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-zinc-500">({totalItems} đánh giá)</p>
          </div>
          <div className="space-y-1 w-64">
            {[5, 4, 3, 2, 1].map((star) => {
              const ratio = stars[`s${star}` as keyof typeof stars] || 0;
              return (
                <div key={star} className="flex items-center gap-1 text-sm">
                  <div className="flex items-center gap-1">
                    {star}
                    <Star
                      size={12}
                      strokeWidth={1}
                      fill="currentColor"
                      className="text-yellow-500"
                    />
                  </div>
                  <div className="flex-1 bg-zinc-200 h-1 rounded overflow-hidden">
                    <div className="  h-1 bg-yellow-400" style={{ width: `${ratio}%` }}></div>
                  </div>
                  <span className="w-10 text-right text-xs">{Math.round(ratio)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Danh sách bình luận */}
      <div className="space-y-4">
        {comments.map((comment, index) => (
          <div key={index} className="py-4 border-t">
            <CommentItem {...comment} />
          </div>
        ))}
        <PaginationControls
          pagination={pagination}
          currentPage={currentPage}
          totalPage={totalPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
