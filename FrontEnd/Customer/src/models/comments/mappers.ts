import { CommentOverviewDto } from './dto';

export function mappedCommentOverviewFromDto(dto: CommentOverviewDto[]) {
  return dto.map((item) => ({
    email: item.KH_email,
    core: parseInt(item.DG_diem),
    createdAt: item.DG_ngayTao.toString(),
    content: item.DH_noiDung,
  }));
}
