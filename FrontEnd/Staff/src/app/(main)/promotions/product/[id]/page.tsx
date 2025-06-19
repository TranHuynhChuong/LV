'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

import api from '@/lib/axiosClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import Loader from '@/components/Loader';
import ProductPromotionForm, { ProductPromotionFormType } from '../components/ProductPromotionForm';
import { ProductSimple } from '@/type/Product';
import { Metadata } from '@/type/Metadata';
import Loading from './loading';
import { ActivityLog } from '@/type/ActivityLog';
import { ActionHistorySheet } from '@/components/ActivityLogSheet';
import { mapDataPushPut } from '../new/page';

export type ChiTietKhuyenMai = {
  KM_id: string;
  SP_id: number;
  CTKM_theoTyLe: boolean;
  CTKM_giaTri: number;
  CTKM_tamNgung: boolean;
  CTKM_daXoa: boolean;
};

export type SanPhamKhuyenMai = {
  SP_id: number;
  SP_ten: string;
  SP_giaBan: number;
  SP_giaNhap: number;
  SP_daBan: number;
  SP_tonKho: number;
  SP_anh: string;
};

export type KhuyenMaiChiTiet = {
  KM_id: string;
  KM_ten: string;
  KM_batDau: Date;
  KM_ketThuc: Date;
  lichSuThaoTac: ActivityLog[];
  chiTietKhuyenMai: ChiTietKhuyenMai[];
  sanPham: SanPhamKhuyenMai[];
};

function mapDataGet(apiData: KhuyenMaiChiTiet): {
  data: ProductPromotionFormType;
  products: ProductSimple[];
  metadata: Metadata[];
} {
  const data: ProductPromotionFormType = {
    code: apiData.KM_id,
    name: apiData.KM_ten,
    from: new Date(apiData.KM_batDau),
    to: new Date(apiData.KM_ketThuc),
    detail: apiData.chiTietKhuyenMai.map((ct: ChiTietKhuyenMai) => ({
      productId: ct.SP_id,
      isPercent: ct.CTKM_theoTyLe,
      value: ct.CTKM_giaTri,
      isBlocked: ct.CTKM_tamNgung,
    })),
  };

  const products: ProductSimple[] = apiData.sanPham.map((sp: SanPhamKhuyenMai) => ({
    id: sp.SP_id,
    name: sp.SP_ten,
    price: sp.SP_giaBan,
    cost: sp.SP_giaNhap,
    sold: sp.SP_daBan,
    stock: sp.SP_tonKho,
    image: sp.SP_anh,
    status: 1, // nếu không có sẵn status thì gán mặc định
  }));

  const metadata =
    apiData.lichSuThaoTac.map((item: ActivityLog) => ({
      time: item.thoiGian,
      action: item.thaoTac,
      user: {
        id: item.nhanVien.NV_id,
        name: item.nhanVien.NV_hoTen,
        phone: item.nhanVien.NV_soDienThoai,
        email: item.nhanVien.NV_email,
      },
    })) ?? [];

  return { data, products, metadata };
}

export default function ProductPromotionDetail() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Giảm giá sản phẩm', href: '/promotions/product' },
      { label: 'Chi tiết' },
    ]);
  }, [setBreadcrumbs]);

  const onSubmit = (data: ProductPromotionFormType) => {
    setIsSubmitting(true);
    const updateData = mapDataPushPut(data, authData.userId);
    api
      .put(`/promotions/${id}`, updateData)
      .then(() => {
        toast.success('Cập nhật thành công!');
        router.back();
      })
      .catch((error) => {
        if (error?.status === 400) {
          toast.error('Cập nhật thất bại!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
        console.error(error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const [data, setData] = useState<ProductPromotionFormType>();
  const [products, setProducts] = useState<ProductSimple[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [metadata, setMetadata] = useState<Metadata[]>([]);

  const fetchData = () => {
    api
      .get(`/promotions/${id}`)
      .then((res) => {
        const { data, products, metadata } = mapDataGet(res.data);
        setData(data);
        setProducts(products);
        setMetadata(metadata);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Không tìm thấy sản phẩm!');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
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
          <ProductPromotionForm onSubmit={onSubmit} defaultValues={data} products={products} />
          <ActionHistorySheet metadata={metadata} />
        </div>

        {isSubmitting && <Loader />}
      </div>
    </div>
  );
}
