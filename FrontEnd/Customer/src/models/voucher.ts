export interface Voucher {
  voucherId: string;
  startDate: Date;
  endDate: Date;
  isPercentage: boolean;
  value: number;
  type: string;
  minValue?: number;
  maxValue?: number;
  staffId: string;
}
