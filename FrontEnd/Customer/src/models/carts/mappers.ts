import { Cart, CartDto, CartItem, CartItemDto } from '.';

export function mapCartToDto(cartItems: CartItem[]): CartItemDto[] {
  return cartItems.map((item) => ({
    SP_id: item.productId,
    GH_soLuong: item.quantity,
    GH_thoiGian: item.dateTime,
  }));
}

export function mapCartFronDto(dto: CartDto[]): Cart[] {
  return dto.map((item) => ({
    productId: item.SP_id,
    quantity: item.GH_soLuong,
    dateTime: item.GH_thoiGian,

    // Product
    cover: item.SP_anh,
    name: item.SP_ten,
    costPrice: item.SP_giaNhap,
    salePrice: item.SP_giaBan,
    discountPrice: item.SP_giaGiam,
    discountPercent: Math.round(((item.SP_giaBan - item.SP_giaGiam) / item.SP_giaBan) * 100),
    inventory: item.SP_tonKho,
    weight: item.SP_trongLuong,
    isOnSale: item.SP_giaGiam < item.SP_giaBan,
  }));
}
