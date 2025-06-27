import { ActivityLogs } from './domain';
import { ActivityLogsDto } from './dto';

export function mapActivityLogsFromDto(dto: ActivityLogsDto[]): ActivityLogs[] {
  return (
    dto.map((item: ActivityLogsDto) => ({
      time: item.thoiGian,
      action: item.thaoTac,
    })) ?? []
  );
}
