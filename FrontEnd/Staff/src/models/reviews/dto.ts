import { ActivityLogsDto } from '../activityLogs';

export type ReviewDto = {
  KH_hoTen: string;
  DG_diem: string;
  DG_ngayTao: Date;
  DG_noiDung?: string;
  DG_daAn: boolean;

  SP_ten: string;
  SP_anh: string;
  SP_id: number;

  DH_id: string;

  lichSuThaoTac: ActivityLogsDto[];

  KH_id: number;
};
