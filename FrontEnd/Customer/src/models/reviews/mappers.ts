import { ReviewOverviewDto } from './dto';

export function mappedReviewOverviewFromDto(dto: ReviewOverviewDto[]) {
  return dto.map((item) => ({
    name: item.KH_hoTen,
    rating: parseInt(item.DG_diem),
    createdAt: item.DG_ngayTao.toString(),
    comment: item.DG_noiDung,
  }));
}
