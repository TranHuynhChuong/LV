import { ActivityLogsDto } from '../activityLogs/dto';
import { ProductOverViewDto } from '../products/dto';

export type ProductPromotionOverviewDto = {
  KM_id: string;
  KM_ten: string;
  KM_batDau: Date;
  KM_ketThuc: Date;
  KM_slspTong: number;
};

export type DetailDto = {
  KM_id: string;
  SP_id: number;
  CTKM_theoTyLe: boolean;
  CTKM_giaTri: number;
  CTKM_tamNgung: boolean;
  CTKM_daXoa: boolean;
};

export type ProductPromotionDetailDto = {
  KM_id: string;
  KM_ten: string;
  KM_batDau: Date;
  KM_ketThuc: Date;
  lichSuThaoTac: ActivityLogsDto[];
  chiTietKhuyenMai: DetailDto[];
  sanPhams: ProductOverViewDto[];
};
