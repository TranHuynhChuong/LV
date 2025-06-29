import { mapActivityLogsFromDto } from '../activityLogs';
import { ReviewDto } from './dto';

export function mappedReviewFromDto(dto: ReviewDto[]) {
  return dto.map((item) => ({
    name: item.KH_hoTen,
    rating: parseInt(item.DG_diem),
    createdAt: item.DG_ngayTao.toString(),
    comment: item.DG_noiDung,
    isHidden: item.DG_daAn,

    productId: item.SP_id,
    productName: item.SP_ten,
    productImage: item.SP_anh,

    orderId: item.DH_id,

    activityLogs: mapActivityLogsFromDto(item.lichSuThaoTac),

    customerId: item.KH_id,
  }));
}
