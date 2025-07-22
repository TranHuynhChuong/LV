import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { GioHangRepository } from './repositories/gio-hang.repository';
import { GioHang } from './schemas/gioHang.schema';
import { SanPhamUtilService } from 'src/san-pham/san-pham.service';

export interface CartReturn {
  SP_id: number;
  GH_soLuong: number;
  GH_thoiGian: string;
  SP_ten: string;
  SP_giaBan: number;
  SP_giaNhap: number;
  SP_tonKho: number;
  SP_giaGiam: number;
  SP_anh: string;
  SP_trongLuong: number;
}

@Injectable()
export class GioHangService {
  constructor(
    private readonly GioHangRepo: GioHangRepository,
    private readonly SanPhamService: SanPhamUtilService
  ) {}

  async create(dto: {
    KH_id: number;
    SP_id: number;
    GH_soLuong: number;
  }): Promise<CartReturn[]> {
    const { KH_id, SP_id, GH_soLuong } = dto;

    const userCarts = await this.findUserCarts(KH_id);

    if (userCarts && userCarts.length >= 99) {
      throw new ConflictException('Thêm giỏ hàng - Vượt số lượng cho phép');
    }

    const product = await this.SanPhamService.findByIds([SP_id]);

    if (!product || product.length === 0) {
      throw new NotFoundException('Thêm giỏ hàng - Không tồn tại sản phẩm');
    }

    if (dto.KH_id === -1) return [];

    const existing = await this.GioHangRepo.findOne(KH_id, SP_id);

    if (existing) {
      const newQuantity = existing.GH_soLuong + GH_soLuong;
      const updated = await this.GioHangRepo.update(KH_id, SP_id, newQuantity);
      if (!updated) {
        throw new BadRequestException(
          'Thêm giỏ hàng - Cập nhật giỏi hàng thất bại'
        );
      }
      return this.getCarts([updated]);
    }
    const create = await this.GioHangRepo.create(dto);
    if (!create) {
      throw new BadRequestException(
        'Thêm giỏ hàng - Thêm mới giỏi hàng thất bại'
      );
    }
    return this.getCarts([create]);
  }

  async update({
    KH_id,
    SP_id,
    GH_soLuong,
  }: {
    KH_id: number;
    SP_id: number;
    GH_soLuong: number;
  }): Promise<CartReturn[]> {
    const item = await this.getCarts([
      {
        KH_id,
        SP_id,
        GH_soLuong,
      },
    ]);
    if (item.length === 0) {
      await this.delete(KH_id, SP_id);
    } else {
      const updated = await this.GioHangRepo.update(
        KH_id,
        SP_id,
        item[0].GH_soLuong
      );

      if (!updated) {
        throw new BadRequestException(
          'Cập nhật giỏ hàng - Cập nhật giỏ hàng thất bại'
        );
      }
    }
    return item;
  }

  async delete(KH_id: number, SP_id: number): Promise<GioHang> {
    const deleted = await this.GioHangRepo.delete(KH_id, SP_id);
    if (!deleted) {
      throw new BadRequestException('Xóa giỏ hàng - Xóa giỏ hàng thất bại');
    }
    return deleted;
  }

  async deleteMany(KH_id: number, SP_id: number[]): Promise<number> {
    const deleted = await this.GioHangRepo.deleteMany(KH_id, SP_id);
    return deleted.deletedCount ?? 0;
  }

  async findUserCarts(KH_id: number): Promise<CartReturn[]> {
    const carts = await this.GioHangRepo.findAll(KH_id);
    const newCart = await this.getCarts(carts);

    const updatedCarts: {
      KH_id: number;
      SP_id: number;
      GH_soLuong: number;
    }[] = [];
    const newCartMap = new Map(newCart.map((item) => [item.SP_id, item]));

    for (const cart of carts) {
      const matched = newCartMap.get(cart.SP_id);

      if (!matched) {
        await this.delete(cart.KH_id, cart.SP_id);
      } else if (cart.GH_soLuong !== matched.GH_soLuong) {
        updatedCarts.push({
          KH_id: cart.KH_id,
          SP_id: cart.SP_id,
          GH_soLuong: matched.GH_soLuong,
        });
      }
    }

    if (updatedCarts.length > 0) {
      await this.GioHangRepo.updateMany(updatedCarts);
    }

    return newCart;
  }

  async getCarts(carts: Partial<GioHang>[]): Promise<CartReturn[]> {
    const productIds = carts
      .map((c) => c.SP_id)
      .filter((id): id is number => id !== undefined);

    const products = await this.SanPhamService.findByIds(productIds);

    if (!products || products.length == 0) return [];
    const result = carts
      .map((cart): any => {
        const product = products.find((p) => p.SP_id === cart.SP_id);
        if (!product) return null;

        // Số lượng sản phẩm trong giỏ hàng = min(số lượng của cart, số lượng tồn kho)
        let quantity = Math.min(cart.GH_soLuong ?? 0, product.SP_tonKho ?? 0);

        // Nếu số lượng trong giỏ là 0 nhưng tồn kho > 0 → phục hồi lại thành 1
        // Sản phẩm trước đó hết hàng, sau lại có hàng
        if ((cart.GH_soLuong ?? 0) === 0 && (product.SP_tonKho ?? 0) > 0) {
          quantity = 1;
        }

        return {
          SP_id: product.SP_id,
          GH_soLuong: quantity,
          GH_thoiGian: cart.GH_thoiGian,
          SP_ten: product.SP_ten,
          SP_giaBan: product.SP_giaBan,
          SP_giaNhap: product.SP_giaNhap,
          SP_tonKho: product.SP_tonKho,
          SP_giaGiam: product.SP_giaGiam,
          SP_anh: product.SP_anh,
          SP_trongLuong: product.SP_trongLuong,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const aTime = a.GH_thoiGian ? new Date(a.GH_thoiGian).getTime() : 0;
        const bTime = b.GH_thoiGian ? new Date(b.GH_thoiGian).getTime() : 0;
        return bTime - aTime;
      }) as CartReturn[];

    return result;
  }
}
