'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

import api from '@/lib/axiosClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import Loader from '@/components/Loader';
import VoucherPromotionForm, { VoucherPromotionFormType } from '../components/VoucherPromotionForm';
import { Metadata } from '@/type/Metadata';
import Loading from './loading';
import { ActivityLog } from '@/type/ActivityLog';
import { ActionHistorySheet } from '@/components/ActivityLogSheet';
import { mapDataPushPut } from '../new/page';

export type MaGiamChiTiet = {
  MG_id: string;
  MG_batDau: Date;
  MG_ketThuc: Date;
  MG_theoTyLe: boolean;
  MG_giaTri: number;
  MG_loai: number;
  MG_toiThieu: number;
  MG_toiDa?: number;
  lichSuThaoTac: ActivityLog[];
};

function mapDataGet(apiData: MaGiamChiTiet): {
  data: VoucherPromotionFormType;
  metadata: Metadata[];
} {
  const data: VoucherPromotionFormType = {
    code: apiData.MG_id,
    from: new Date(apiData.MG_batDau),
    to: new Date(apiData.MG_ketThuc),
    type: apiData.MG_loai.toString() as '1' | '2',
    isPercentage: apiData.MG_theoTyLe,
    discountValue: apiData.MG_giaTri,
    minOrderValue: apiData.MG_toiThieu,
    maxDiscount: apiData.MG_toiDa,
  };

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

  return { data, metadata };
}

export default function VoucherPromotionDetail() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Giảm giá sản phẩm', href: '/promotions/voucher' },
      { label: 'Chi tiết' },
    ]);
  }, [setBreadcrumbs]);

  const onSubmit = (data: VoucherPromotionFormType) => {
    setIsSubmitting(true);
    const updateData = mapDataPushPut(data, authData.userId);
    api
      .put(`/vouchers/${id}`, updateData)
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

  const [data, setData] = useState<VoucherPromotionFormType>();
  const [loading, setLoading] = useState<boolean>(false);

  const [metadata, setMetadata] = useState<Metadata[]>([]);

  const fetchData = () => {
    api
      .get(`/vouchers/${id}`)
      .then((res) => {
        const { data, metadata } = mapDataGet(res.data);
        setData(data);
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
          <VoucherPromotionForm onSubmit={onSubmit} defaultValues={data} />
          <ActionHistorySheet metadata={metadata} />
        </div>

        {isSubmitting && <Loader />}
      </div>
    </div>
  );
}
