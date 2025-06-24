import { ActivityLogs } from './domain';
import { ActivityLogsDto } from './dto';

export function mapActivityLogsFromDto(dto: ActivityLogsDto[]): ActivityLogs[] {
  return (
    dto.map((item: ActivityLogsDto) => ({
      time: item.thoiGian,
      action: item.thaoTac,
      user: {
        id: item.nhanVien.NV_id,
        name: item.nhanVien.NV_hoTen,
        phone: item.nhanVien.NV_soDienThoai,
        email: item.nhanVien.NV_email,
      },
    })) ?? []
  );
}
