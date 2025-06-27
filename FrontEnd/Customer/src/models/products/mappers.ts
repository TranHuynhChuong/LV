import { ImageDto, ProductDetail, ProductDetailDto, ProductOverview, ProductOverviewDto } from '.';

export function mapProductDetailFormDto(dto: ProductDetailDto): ProductDetail {
  const getCoverImageUrl = (images: ImageDto[]): string => {
    const cover = images.find((img) => img.A_anhBia);
    return cover ? cover.A_url : '';
  };

  const getProductImageUrls = (images: ImageDto[]): string[] => {
    return images.filter((img) => !img.A_anhBia).map((img) => img.A_url);
  };

  const discountPercent = Math.round(((dto.SP_giaBan - dto.SP_giaGiam) / dto.SP_giaBan) * 100);
  return {
    name: dto.SP_ten,
    id: dto.SP_id,
    categories: dto.SP_TL.map((tl: { TL_id: number; TL_ten: string }) => ({
      id: tl.TL_id,
      name: tl.TL_ten,
    })),
    status: dto.SP_trangThai,
    summary: dto.SP_tomTat,
    description: dto.SP_moTa,
    author: dto.SP_tacGia,
    publisher: dto.SP_nhaXuatBan,
    publishYear: dto.SP_namXuatBan,
    page: dto.SP_soTrang,
    isbn: dto.SP_isbn,
    language: dto.SP_ngonNgu,
    translator: dto.SP_nguoiDich,
    salePrice: dto.SP_giaBan,
    costPrice: dto.SP_giaNhap,
    discountPrice: dto.SP_giaGiam,
    discountPercent,
    inventory: dto.SP_tonKho,
    saled: dto.SP_daBan,
    weight: dto.SP_trongLuong,
    rating: dto.SP_diemDG,
    coverImage: getCoverImageUrl(dto.SP_anh),
    productImages: getProductImageUrls(dto.SP_anh),
    isOnSale: dto.SP_giaGiam < dto.SP_giaBan,
    similar: dto.SP_tuongTu.map((item) => {
      const discountPercentItem = Math.round(
        ((item.SP_giaBan - item.SP_giaGiam) / item.SP_giaBan) * 100
      );
      return {
        id: item.SP_id,
        name: item.SP_ten,
        salePrice: item.SP_giaBan,
        costPrice: item.SP_giaNhap,
        discountPrice: item.SP_giaGiam,
        sold: item.SP_daBan,
        inventory: item.SP_tonKho,
        image: item.SP_anh,
        status: item.SP_trangThai,
        rating: item.SP_diemDG,
        categories: item.TL_id,
        discountPercent: discountPercentItem,
        isOnSale: item.SP_giaGiam < item.SP_giaBan,
      };
    }),
  };
}

export function mapProductOverviewFromDto(dto: ProductOverviewDto): ProductOverview {
  const discountPercent = Math.round(((dto.SP_giaBan - dto.SP_giaGiam) / dto.SP_giaBan) * 100);
  const isOnSale = dto.SP_giaGiam < dto.SP_giaBan;

  return {
    id: dto.SP_id,
    name: dto.SP_ten,
    salePrice: dto.SP_giaBan,
    costPrice: dto.SP_giaNhap,
    discountPrice: dto.SP_giaGiam,
    discountPercent,
    image: dto.SP_anh,
    inventory: dto.SP_tonKho,
    sold: dto.SP_daBan,
    rating: dto.SP_diemDG,
    categories: dto.TL_id,
    status: dto.SP_trangThai,
    isOnSale,
  };
}

export function mapProductOverviewListFromDto(dtos: ProductOverviewDto[]): ProductOverview[] {
  return dtos.map(mapProductOverviewFromDto);
}
