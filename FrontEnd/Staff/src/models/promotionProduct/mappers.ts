import { ActivityLogs, mapActivityLogsFromDto } from '../activityLogs';
import { ProductOverView } from '../products/domain';
import { ProductPromotionDetail, ProductPromotionOverview } from './domain';
import { DetailDto, ProductPromotionDetailDto, ProductPromotionOverviewDto } from './dto';

export function mapProductPromotionDetailFromDto(dto: ProductPromotionDetailDto): {
  data: ProductPromotionDetail;
  products: ProductOverView[];
  activityLogs: ActivityLogs[];
} {
  const data: ProductPromotionDetail = {
    id: dto.KM_id,
    name: dto.KM_ten,
    from: new Date(dto.KM_batDau),
    to: new Date(dto.KM_ketThuc),
    details: dto.chiTietKhuyenMai.map((ct: DetailDto) => ({
      productId: ct.SP_id,
      isPercent: ct.CTKM_theoTyLe,
      value: ct.CTKM_giaTri,
      isBlocked: ct.CTKM_tamNgung,
    })),
  };

  const products: ProductOverView[] = dto.sanPhams.map((p) => ({
    id: p.SP_id,
    name: p.SP_ten,
    salePrice: p.SP_giaBan,
    inventory: p.SP_tonKho,
    costPrice: p.SP_giaNhap,
    image: p.SP_anh,
    status: p.SP_trangThai,
  }));

  const activityLogs = mapActivityLogsFromDto(dto.lichSuThaoTac);

  return { data, products, activityLogs };
}
export function mapProductPromotionsFromDto(
  dto: ProductPromotionOverviewDto[]
): ProductPromotionOverview[] {
  return dto.map((item) => ({
    id: item.KM_id,
    name: item.KM_ten,
    startAt: item.KM_batDau,
    endAt: item.KM_ketThuc,
    totalProducts: item.KM_slspTong,
  }));
}

interface ProductPromotionDetailToDto {
  KM_id: string;
  KM_ten: string;
  KM_batDau: string;
  KM_ketThuc: string;
  KM_chiTiet: {
    SP_id: number;
    CTKM_theoTyLe: boolean;
    CTKM_giaTri: number;
    CTKM_tamNgung: boolean;
  }[];
  NV_id: string;
}

export function mapProductPromotionDetailToDto(
  data: ProductPromotionDetail,
  staffId: string
): ProductPromotionDetailToDto {
  const dto: ProductPromotionDetailToDto = {
    KM_id: data.id,
    KM_ten: data.name ?? '',
    KM_batDau: data.from.toISOString(),
    KM_ketThuc: data.to.toISOString(),
    KM_chiTiet: data.details.map((detail) => ({
      SP_id: detail.productId,
      CTKM_theoTyLe: detail.isPercent,
      CTKM_giaTri: detail.value,
      CTKM_tamNgung: detail.isBlocked,
    })),
    NV_id: staffId,
  };

  return dto;
}
