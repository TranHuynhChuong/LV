export type VoucherPromotionDetailDto = {
  MG_id: string;
  MG_batDau: Date;
  MG_ketThuc: Date;
  MG_theoTyLe: boolean;
  MG_giaTri: number;
  MG_loai: string;
  MG_toiThieu?: number;
  MG_toiDa?: number;
};

export type VoucherPromotionOverviewDto = {
  MG_id: string;
  MG_batDau: Date;
  MG_ketThuc: Date;
  MG_loai: string;
};
