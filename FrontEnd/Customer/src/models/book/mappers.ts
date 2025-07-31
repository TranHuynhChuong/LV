import { ImageDto, BookDetail, BookDetailDto, BookOverview, BookOverviewDto } from '.';

export function mapBookDetailFormDto(dto: BookDetailDto): BookDetail {
  const getImageUrls = (images: ImageDto[]): string[] => {
    return images
      .sort((a, b) => (b.A_anhBia ? 1 : 0) - (a.A_anhBia ? 1 : 0))
      .map((img) => img.A_url);
  };

  const discountPercent = Math.round(((dto.S_giaBan - dto.S_giaGiam) / dto.S_giaBan) * 100);
  return {
    name: dto.S_ten,
    id: dto.S_id,
    categories: dto.S_TL.map((tl: { TL_id: number; TL_ten: string }) => ({
      id: tl.TL_id,
      name: tl.TL_ten,
    })),
    status: dto.S_trangThai,
    summary: dto.S_tomTat,
    description: dto.S_moTa,
    author: dto.S_tacGia,
    publisher: dto.S_nhaXuatBan,
    publishYear: dto.S_namXuatBan,
    page: dto.S_soTrang,
    isbn: dto.S_isbn,
    language: dto.S_ngonNgu,
    translator: dto.S_nguoiDich,
    salePrice: dto.S_giaBan,
    costPrice: dto.S_giaNhap,
    discountPrice: dto.S_giaGiam,
    discountPercent,
    inventory: dto.S_tonKho,
    saled: dto.S_daBan,
    weight: dto.S_trongLuong,
    size: dto.S_kichThuoc,
    rating: dto.S_soLuongDG > 0 ? dto.S_diemDG / dto.S_soLuongDG : 0,
    amountRating: dto.S_soLuongDG,
    images: getImageUrls(dto.S_anh),
    isOnSale: dto.S_giaGiam < dto.S_giaBan,
    similar: dto.S_tuongTu.map((item) => {
      const discountPercentItem = Math.round(
        ((item.S_giaBan - item.S_giaGiam) / item.S_giaBan) * 100
      );
      return {
        id: item.S_id,
        name: item.S_ten,
        salePrice: item.S_giaBan,
        costPrice: item.S_giaNhap,
        discountPrice: item.S_giaGiam,
        sold: item.S_daBan,
        inventory: item.S_tonKho,
        image: item.S_anh,
        status: item.S_trangThai,
        rating: item.S_soLuongDG > 0 ? item.S_diemDG / item.S_soLuongDG : 0,
        amountRating: item.S_soLuongDG,
        categories: item.TL_id,
        discountPercent: discountPercentItem,
        isOnSale: item.S_giaGiam < item.S_giaBan,
      };
    }),
  };
}

export function mapBookOverviewFromDto(dto: BookOverviewDto): BookOverview {
  const discountPercent = Math.round(((dto.S_giaBan - dto.S_giaGiam) / dto.S_giaBan) * 100);
  const isOnSale = dto.S_giaGiam < dto.S_giaBan;

  return {
    id: dto.S_id,
    name: dto.S_ten,
    salePrice: dto.S_giaBan,
    costPrice: dto.S_giaNhap,
    discountPrice: dto.S_giaGiam,
    discountPercent,
    image: dto.S_anh,
    inventory: dto.S_tonKho,
    sold: dto.S_daBan,
    rating: dto.S_soLuongDG > 0 ? dto.S_diemDG / dto.S_soLuongDG : 0,
    amountRating: dto.S_soLuongDG,
    categories: dto.TL_id,
    status: dto.S_trangThai,
    isOnSale,
  };
}

export function mapBookOverviewListFromDto(dtos: BookOverviewDto[]): BookOverview[] {
  return dtos.map(mapBookOverviewFromDto);
}
