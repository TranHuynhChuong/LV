'use client';

import { useEffect, useState } from 'react';
import ProductTable, { Product } from '../components/productTab';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function ProductLive() {
  const [data, setData] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;
  const [loading, setLoading] = useState(false);

  // Tạo mảng sản phẩm giả lập 1000 sản phẩm 1 lần duy nhất
  const allProducts = Array.from({ length: 1000 }, (_, i) => ({
    code: i + 1,
    name: `Sản phẩm Sản phẩm Sản phẩm ${i + 1}`,
    quantity: Math.floor(Math.random() * 100),
    price: 10000 + i * 10,
    sold: Math.floor(Math.random() * 50),
    status: 1,
    imageUrl: `https://picsum.photos/seed/${i + 1}/200/200`,
  }));

  // Giữ state sản phẩm toàn bộ để xử lý ẩn/hiện/xóa, khởi tạo khi component mount
  const [allData, setAllData] = useState<Product[]>([]);

  useEffect(() => {
    // Mô phỏng gọi api: gán dữ liệu gốc
    setAllData(allProducts);
    setTotalItems(allProducts.length);
  }, []);

  useEffect(() => {
    // Lấy dữ liệu trang hiện tại từ allData
    setLoading(true);
    const timeoutId = setTimeout(() => {
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      setData(allData.slice(start, end));
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [allData, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleDelete = (code: number) => {
    if (window.confirm(`Xác nhận xóa sản phẩm: ${code}?`)) {
      // Xóa sản phẩm bằng cách set trạng thái status = 0 (hoặc lọc ra khỏi allData)
      // Ở đây mình sẽ lọc ra khỏi danh sách allData
      setAllData((prev) => prev.filter((item) => item.code !== code));
      alert('Đã xóa!');
      // Nếu xóa hết trang hiện tại thì quay về trang trước
      const maxPage = Math.ceil((allData.length - 1) / pageSize);
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
    <div>
      <div className="flex items-center justify-between my-4 pl-4">
        <h1 className="text-xl font-semibold ">{totalItems} sản phẩm</h1>
        <Link href="products/new">
          <Button className="cursor-pointer">
            <Plus /> Thêm mới
          </Button>
        </Link>
      </div>
      <ProductTable
        data={data}
        totalItems={allData.length}
        pageSize={pageSize}
        currentPage={currentPage}
        loading={loading}
        onPageChange={handlePageChange}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
