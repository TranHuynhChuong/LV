import { ActivityLogsDto } from '../activityLogs/dto';
import { BookOverViewDto } from '../books/dto';

export type BookPromotionOverviewDto = {
  KM_id: number;
  KM_ten: string;
  KM_batDau: Date;
  KM_ketThuc: Date;
  KM_slTong: number;
};

export type DetailDto = {
  KM_id: number;
  S_id: number;
  CTKM_theoTyLe: boolean;
  CTKM_giaTri: number;
  CTKM_tamNgung: boolean;
  CTKM_daXoa: boolean;
};

export type BookPromotionDetailDto = {
  KM_id: number;
  KM_ten: string;
  KM_batDau: Date;
  KM_ketThuc: Date;
  lichSuThaoTac: ActivityLogsDto[];
  chiTietKhuyenMai: DetailDto[];
  saches: BookOverViewDto[];
};

export type BookPromotionDetailToDto = {
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
};
