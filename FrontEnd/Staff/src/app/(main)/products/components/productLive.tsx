'use client';

import { useEffect, useState } from 'react';
import ProductTable, { Product } from '../components/productTab';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import PaginationControls from '@/components/PaginationControls';

export default function ProductLive() {
  const [data, setData] = useState<Product[]>([]);
  const [paginate, setPaginate] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const pageSize = 24;
  const [loading, setLoading] = useState(false);

  const allProducts = Array.from({ length: 1000 }, (_, i) => ({
    code: i + 1,
    name: `Sản phẩm ${i + 1}`,
    quantity: Math.floor(Math.random() * 100),
    price: 10000 + i * 10,
    sold: Math.floor(Math.random() * 50),
    status: 1,
    imageUrl: `https://picsum.photos/seed/${i + 1}/200/200`,
  }));

  const [allData, setAllData] = useState<Product[]>([]);

  useEffect(() => {
    setAllData(allProducts);
    setTotalItems(allProducts.length);
    setTotalPage(Math.ceil(allProducts.length / pageSize));
  }, []);

  useEffect(() => {
    setLoading(true);
    const timeoutId = setTimeout(() => {
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      setData(allData.slice(start, end));
      setLoading(false);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [allData, currentPage]);

  useEffect(() => {
    setPaginate(generatePaginate(currentPage, totalPage));
  }, [currentPage, totalPage]);

  const generatePaginate = (current: number, total: number): number[] => {
    const delta = 2;
    const range: number[] = [];

    let start = Math.max(1, current - delta);
    let end = Math.min(total, current + delta);

    // Cố gắng giữ đủ (2 * delta + 1) trang nếu có thể
    const pagesToShow = 2 * delta + 1;
    const actualCount = end - start + 1;

    if (actualCount < pagesToShow) {
      const missing = pagesToShow - actualCount;

      // Ưu tiên dồn về đầu nếu gần cuối
      if (start > 2) {
        start = Math.max(2, start - missing);
      } else if (end < total - 1) {
        end = Math.min(total - 1, end + missing);
      }
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPage);
  };

  const handleDelete = (code: number) => {
    if (window.confirm(`Xác nhận xóa sản phẩm: ${code}?`)) {
      setAllData((prev) => prev.filter((item) => item.code !== code));
      alert('Đã xóa!');
      const newTotal = allData.length - 1;
      const maxPage = Math.ceil(newTotal / pageSize);
      setTotalItems(newTotal);
      setTotalPage(maxPage);
      if (currentPage > maxPage) setCurrentPage(maxPage);
    }
  };

  const handleToggleStatus = (code: number, newStatus: number) => {
    setAllData((prev) =>
      prev.map((item) => (item.code === code ? { ...item, status: newStatus } : item))
    );
    alert(`Đã ${newStatus === 1 ? 'hiện' : 'ẩn'} sản phẩm mã: ${code}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pl- my-4">
        <h1 className="text-xl font-semibold ">{totalItems} sản phẩm</h1>
        <Link href="products/new">
          <Button className="cursor-pointer">
            <Plus /> Thêm mới
          </Button>
        </Link>
      </div>
      <ProductTable
        data={data}
        loading={loading}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />
      <PaginationControls
        paginate={paginate}
        totalPage={totalPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onFirstPage={handleFirstPage}
        onLastPage={handleLastPage}
      />
    </div>
  );
}
