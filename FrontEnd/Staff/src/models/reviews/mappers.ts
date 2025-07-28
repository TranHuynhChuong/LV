import { mapActivityLogsFromDto } from '../activityLogs';
import { ReviewDto } from './dto';

export function mappedReviewFromDto(dto: ReviewDto[]) {
  return dto.map((item) => ({
    name: item.KH_hoTen,
    rating: parseInt(item.DG_diem),
    createdAt: item.DG_ngayTao.toString(),
    comment: item.DG_noiDung,
    isHidden: item.DG_daAn,
    bookId: item.S_id,
    bookName: item.S_ten,
    bookImage: item.S_anh,
    orderId: item.DH_id,
    activityLogs: mapActivityLogsFromDto(item.lichSuThaoTac),
    customerId: item.KH_id,
  }));
}
