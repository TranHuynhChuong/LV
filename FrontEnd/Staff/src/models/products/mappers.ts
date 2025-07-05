import { ProductOverView, ProductOverViewDto } from '.';

export function mapProductsOverviewFromDto(data: ProductOverViewDto[]): ProductOverView[] {
  return data.map((item) => ({
    id: item.SP_id,
    isbn: item.SP_isbn,
    name: item.SP_ten,
    salePrice: item.SP_giaBan,
    inventory: item.SP_tonKho,
    costPrice: item.SP_giaNhap,
    sold: item.SP_daBan,
    image: item.SP_anh,
    status: item.SP_trangThai,
  }));
}
