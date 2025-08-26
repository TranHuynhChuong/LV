import { VoucherPromotionDetail, VoucherPromotionOverview } from './domain';
import { VoucherPromotionDetailDto } from './dto';

export function mapVoucherPromotionOverviewFromDto(
  dto: VoucherPromotionDetailDto[]
): VoucherPromotionOverview[] {
  return dto.map((item) => ({
    id: item.MG_id,
    startAt: item.MG_batDau,
    endAt: item.MG_ketThuc,
    type: item.MG_loai,
  }));
}

export function mapVoucherPromotionDetailFromDto(dto: VoucherPromotionDetailDto): {
  data: VoucherPromotionDetail;
} {
  const data: VoucherPromotionDetail = {
    id: dto.MG_id,
    startAt: new Date(dto.MG_batDau),
    endAt: new Date(dto.MG_ketThuc),
    type: dto.MG_loai,
    isPercentage: dto.MG_theoTyLe,
    discountValue: dto.MG_giaTri,
    minOrderValue: dto.MG_toiThieu,
    maxDiscount: dto.MG_toiDa,
  };

  return { data };
}

export function mapVoucherPromotionDetailToDto(data: VoucherPromotionDetail, staffId: string) {
  return {
    MG_id: data.id,
    MG_batDau: data.startAt,
    MG_ketThuc: data.endAt,
    NV_id: staffId,
    MG_theoTyLe: data.isPercentage,
    MG_giaTri: data.discountValue,
    MG_loai: data.type,
    MG_toiThieu: data.minOrderValue,
    MG_toiDa: data.maxDiscount,
  };
}
