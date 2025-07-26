import { BookOverView, BookOverViewDto } from '.';

export function mapBooksOverviewFromDto(data: BookOverViewDto[]): BookOverView[] {
  return data.map((item) => ({
    id: item.S_id,
    isbn: item.S_isbn,
    name: item.S_ten,
    salePrice: item.S_giaBan,
    inventory: item.S_tonKho,
    costPrice: item.S_giaNhap,
    sold: item.S_daBan,
    image: item.S_anh,
    status: item.S_trangThai,
  }));
}
