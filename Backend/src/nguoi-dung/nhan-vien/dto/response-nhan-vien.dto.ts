import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { ActivityLog } from 'src/lich-su-thao-tac/services/lich-su-thao-tac.service';

export class NhanVienResponseDto {
  @Expose({ name: 'NV_id' })
  id: string;

  @Expose({ name: 'NV_hoTen' })
  fullName: string;

  @Expose({ name: 'NV_email' })
  email: string;

  @Expose({ name: 'NV_soDienThoai' })
  phone: string;

  @Expose({ name: 'NV_vaiTro' })
  role: number;

  @Expose({ name: 'NV_tenVaiTro' })
  roleName: number;

  @Expose({ name: 'NV_daKhoa' })
  @IsBoolean()
  isBlock: boolean;

  @Expose({ name: 'NV_matKhau' })
  password: string;

  @Expose({ name: 'lichSuThaoTac' })
  @IsOptional()
  activityLogs: ActivityLog[];
}
