import { Expose, Type } from 'class-transformer';
import { BookStatus } from '../schemas/sach.schema';

class CategoriesDto {
  @Expose({ name: 'TL_id' })
  id: number;

  @Expose({ name: 'TL_ten' })
  name: string;
}

class ImageDto {
  @Expose({ name: 'A_publicId' })
  publicId: string;

  @Expose({ name: 'A_url' })
  url: string;

  @Expose({ name: 'A_anhBia' })
  isCover: boolean;
}

export class SachResponseDto {
  @Expose({ name: 'S_id' })
  bookId: number;

  @Expose({ name: 'S_ten' })
  title: string;

  @Expose({ name: 'S_tacGia' })
  author: string;

  @Expose({ name: 'S_nhaXuatBan' })
  publisher: string;

  @Expose({ name: 'S_namXuatBan' })
  publishYear: number;

  @Expose({ name: 'S_soTrang' })
  page: number;

  @Expose({ name: 'S_isbn' })
  isbn: string;

  @Expose({ name: 'S_nguoiDich' })
  translator?: string;

  @Expose({ name: 'S_ngonNgu' })
  language: string;

  @Expose({ name: 'S_tomTat' })
  summary: string;

  @Expose({ name: 'S_moTa' })
  description?: string;

  @Expose({ name: 'S_giaBan' })
  sellingPrice: number;

  @Expose({ name: 'S_giaNhap' })
  importPrice: number;

  @Expose({ name: 'S_giaGiam' })
  purchasePrice: number;

  @Expose({ name: 'S_tonKho' })
  inventory: number;

  @Expose({ name: 'S_trongLuong' })
  weight: number;

  @Expose({ name: 'S_kichThuoc' })
  size: string;

  @Expose({ name: 'S_trangThai' })
  status: BookStatus;

  @Expose({ name: 'S_daBan' })
  sold: number;

  @Expose({ name: 'S_diemDG' })
  rating: number;

  @Expose({ name: 'S_soLuongDG' })
  reviewCount: number;

  @Expose({ name: 'TL_id' })
  categoryIds: number[];

  @Type(() => CategoriesDto)
  @Expose({ name: 'S_TL' })
  categories: CategoriesDto[];

  @Type(() => ImageDto)
  @Expose({ name: 'S_anh' })
  images: ImageDto[] | string;

  @Type(() => SachResponseDto)
  @Expose({ name: 'S_tuongTu' })
  similar: SachResponseDto[];
}
