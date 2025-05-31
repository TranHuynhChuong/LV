'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CategoryForm from '../components/categoryForm';
import api from '@/lib/axiosClient';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import Loading from './loading';

type CategoryFormData = {
  id: number;
  name?: string;
  parentId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  staff?: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
};

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { authData } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<CategoryFormData | null>(null);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Danh mục', href: '/category' },
      { label: 'Chi tiết thể loại' },
    ]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    if (!id) return;

    api
      .get(`/categories/${id}`)
      .then((res) => {
        const data = res.data;
        console.log(data);
        setInitialData({
          id: data.TL_id,
          name: data.TL_ten,
          createdAt: data.TL_tao,
          updatedAt: data.TL_capNhat,
          parentId: data.TL_idTL ?? null,
          staff: {
            id: data.NV_id?.NV_id,
            name: data.NV_id?.NV_hoTen,
            phone: data.NV_id?.NV_soDienThoai,
            email: data.NV_id?.NV_email,
          },
        });
      })
      .catch((error) => {
        console.error(error);
        toast.error('Không tìm thấy thể loại!');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = (data: { name: string; id?: number | null; parentId?: number | null }) => {
    const apiData = {
      TL_ten: data.name,
      TL_idTL: data.parentId ?? null,
      NV_id: authData.userId,
    };

    // Use data.id if available, otherwise fallback to the id from params
    const categoryId = data.id ?? id;
    console.log(apiData);
    api
      .put(`/categories/${categoryId}`, apiData)
      .then(() => {
        toast.success('Cập nhật thành công');
        router.back();
      })
      .catch((error) => {
        if (error.status === 400) {
          toast.error('Cập nhật thất bại!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
        console.error(error);
      });
  };

  const handleDelete = () => {
    api
      .delete(`/categories/${id}`)
      .then((res) => {
        toast.success(res.data.message ?? 'Xóa thành công');
        router.back();
      })
      .catch((error) => {
        if (error.status === 400) {
          toast.error('Xóa thất bại!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
        console.error(error);
      });
  };

  if (loading) return <Loading />;
  if (!initialData) return <Loading />;

  return (
    <div className="relative w-full max-w-xl h-fit min-w-md">
      <CategoryForm onSubmit={handleSubmit} onDelete={handleDelete} defaultValues={initialData} />
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="absolute cursor-pointer top-6 right-6">
            <Info />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Thông tin dữ liệu</SheetTitle>
            <div className="mt-4 space-y-3 text-sm ">
              <div>
                <span className="font-medium">Ngày tạo:</span>{' '}
                {initialData.createdAt
                  ? new Date(initialData.createdAt).toLocaleString('vi-VN')
                  : 'N/A'}
              </div>
              <div>
                <span className="font-medium">Cập nhật:</span>{' '}
                {initialData.updatedAt
                  ? new Date(initialData.updatedAt).toLocaleString('vi-VN')
                  : 'N/A'}
              </div>
              <div>
                <div className="font-medium">Người thực hiện</div>
                <span className="text-xs italic font-light text-gray-500">
                  Người tạo hoặc cập nhật thể loại
                </span>
              </div>
              <div className="pl-4">
                <span className="font-medium">Mã số:</span> {initialData.staff?.id}
              </div>
              <div className="pl-4">
                <span className="font-medium">Họ tên:</span> {initialData.staff?.name}
              </div>
              <div className="pl-4">
                <span className="font-medium">Email:</span> {initialData.staff?.email}
              </div>
              <div className="pl-4">
                <span className="font-medium">Số điện thoại:</span> {initialData.staff?.phone}
              </div>
            </div>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}
