import { ReviewDto, ReviewOverviewDto } from './dto';

export function mappedReviewOverviewFromDto(dto: ReviewOverviewDto[]) {
  return dto.map((item) => ({
    name: item.KH_hoTen,
    rating: parseInt(item.DG_diem),
    createdAt: item.DG_ngayTao.toString(),
    comment: item.DG_noiDung,
    bookName: item.S_ten,
  }));
}

export function mappedReviewFromDto(dto: ReviewDto[]) {
  return dto.map((item) => ({
    rating: parseInt(item.DG_diem),
    createdAt: item.DG_ngayTao.toString(),
    comment: item.DG_noiDung,
    bookName: item.S_ten,
    bookImage: item.S_anh,
    orderId: item.DH_id,
  }));
}
