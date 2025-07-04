import { Voucher, VoucherDto } from '.';

export function mapVouchersFromDto(maGiamList: VoucherDto[]): Voucher[] {
  return maGiamList.map((mg) => ({
    type: mg.MG_loai,
    code: mg.MG_id,
    from: new Date(mg.MG_batDau),
    to: new Date(mg.MG_ketThuc),
    isPercentage: mg.MG_theoTyLe,
    discountValue: mg.MG_giaTri,
    minOrderValue: mg.MG_toiThieu,
    maxDiscount: mg.MG_toiDa,
  }));
}
