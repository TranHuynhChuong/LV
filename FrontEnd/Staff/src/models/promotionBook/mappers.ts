import { ActivityLogs, mapActivityLogsFromDto } from '../activityLogs';
import { BookOverView } from '../books/domain';
import { BookPromotionDetail, BookPromotionOverview } from './domain';
import {
  DetailDto,
  BookPromotionDetailDto,
  BookPromotionOverviewDto,
  BookPromotionDetailToDto,
} from './dto';

export function mapBookPromotionDetailFromDto(dto: BookPromotionDetailDto): {
  data: BookPromotionDetail;
  books: BookOverView[];
  activityLogs: ActivityLogs[];
} {
  const data: BookPromotionDetail = {
    id: dto.KM_id,
    name: dto.KM_ten,
    from: new Date(dto.KM_batDau),
    to: new Date(dto.KM_ketThuc),
    details: dto.chiTietKhuyenMai.map((d: DetailDto) => ({
      bookId: d.S_id,
      isPercent: d.CTKM_theoTyLe,
      value: d.CTKM_giaTri,
      salePrice: d.CTKM_giaSauGiam,
    })),
  };

  const books: BookOverView[] = dto.saches.map((b) => ({
    id: b.S_id,
    isbn: b.S_isbn,
    name: b.S_ten,
    salePrice: b.S_giaBan,
    inventory: b.S_tonKho,
    costPrice: b.S_giaNhap,
    image: b.S_anh,
    status: b.S_trangThai,
  }));

  const activityLogs = mapActivityLogsFromDto(dto.lichSuThaoTac);

  return { data, books, activityLogs };
}

export function mapBookPromotionsFromDto(dto: BookPromotionOverviewDto[]): BookPromotionOverview[] {
  return dto.map((item) => ({
    id: item.KM_id,
    name: item.KM_ten,
    startAt: item.KM_batDau,
    endAt: item.KM_ketThuc,
    totalBooks: item.KM_slTong,
  }));
}

export function mapBookPromotionDetailToDto(
  data: BookPromotionDetail,
  staffId: string
): BookPromotionDetailToDto {
  const dto: BookPromotionDetailToDto = {
    KM_ten: data.name ?? '',
    KM_batDau: data.from.toISOString(),
    KM_ketThuc: data.to.toISOString(),
    KM_chiTiet: data.details.map((detail) => ({
      S_id: detail.bookId,
      CTKM_theoTyLe: detail.isPercent,
      CTKM_giaTri: detail.value,
      CTKM_giaSauGiam: detail.salePrice,
    })),
    NV_id: staffId,
  };

  return dto;
}
