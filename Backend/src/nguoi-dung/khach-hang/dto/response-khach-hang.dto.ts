import { Expose } from 'class-transformer';

export class KhachHangResponseDto {
  @Expose({ name: 'KH_id' })
  id: number;

  @Expose({ name: 'KH_email' })
  email: string;

  @Expose({ name: 'KH_hoTen' })
  name: string;

  @Expose({ name: 'KH_ngayTao' })
  createAt: Date;

  @Expose({ name: 'KH_matKhau' })
  password: Date;

  @Expose({ name: 'KH_gioiTinh' })
  gender: string;

  @Expose({ name: 'KH_ngaySinh' })
  dob: Date;
}
