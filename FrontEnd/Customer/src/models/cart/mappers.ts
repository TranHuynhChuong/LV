import { Cart, CartDto, CartItem, CartItemDto } from '.';

export function mapCartToDto(cartItems: CartItem[]): CartItemDto[] {
  return cartItems.map((item) => ({
    S_id: item.id,
    GH_soLuong: item.quantity,
    GH_thoiGian: item.dateTime,
  }));
}

export function mapCartFronDto(dto: CartDto[]): Cart[] {
  return dto.map((item) => ({
    id: item.S_id,
    quantity: item.GH_soLuong,
    dateTime: item.GH_thoiGian,

    cover: item.S_anh,
    name: item.S_ten,
    costPrice: item.S_giaNhap,
    salePrice: item.S_giaBan,
    discountPrice: item.S_giaGiam,
    discountPercent: Math.round(((item.S_giaBan - item.S_giaGiam) / item.S_giaBan) * 100),
    inventory: item.S_tonKho,
    weight: item.S_trongLuong,
    isOnSale: item.S_giaGiam < item.S_giaBan,
  }));
}
