import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { GioHangRepository } from './repositories/gio-hang.repository';
import { GioHang } from './schemas/gio-hang.schema';
import { SachUtilService } from 'src/sach/sach.service';

export interface CartReturn {
  S_id: number;
  GH_soLuong: number;
  GH_thoiGian: string;
  S_ten: string;
  S_giaBan: number;
  S_giaNhap: number;
  S_tonKho: number;
  S_giaGiam: number;
  S_anh: string;
  S_trongLuong: number;
}

@Injectable()
export class GioHangService {
  constructor(
    private readonly GioHangRepo: GioHangRepository,
    private readonly SachService: SachUtilService
  ) {}

  async create(dto: {
    KH_id: number;
    S_id: number;
    GH_soLuong: number;
  }): Promise<CartReturn[]> {
    const { KH_id, S_id, GH_soLuong } = dto;

    const userCarts = await this.findUserCarts(KH_id);

    if (userCarts && userCarts.length >= 99) {
      throw new ConflictException('Thêm giỏ hàng - Vượt số lượng cho phép');
    }

    const product = await this.SachService.findByIds([S_id]);

    if (!product || product.length === 0) {
      throw new NotFoundException('Thêm giỏ hàng - Không tồn tại sản phẩm');
    }

    if (dto.KH_id === -1) return [];

    const existing = await this.GioHangRepo.findOne(KH_id, S_id);

    if (existing) {
      const newQuantity = existing.GH_soLuong + GH_soLuong;
      const updated = await this.GioHangRepo.update(KH_id, S_id, newQuantity);
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
    S_id,
    GH_soLuong,
  }: {
    KH_id: number;
    S_id: number;
    GH_soLuong: number;
  }): Promise<CartReturn[]> {
    const item = await this.getCarts([
      {
        KH_id,
        S_id,
        GH_soLuong,
      },
    ]);
    if (item.length === 0) {
      await this.delete(KH_id, S_id);
    } else {
      const updated = await this.GioHangRepo.update(
        KH_id,
        S_id,
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

  async delete(KH_id: number, S_id: number): Promise<GioHang> {
    const deleted = await this.GioHangRepo.delete(KH_id, S_id);
    if (!deleted) {
      throw new BadRequestException('Xóa giỏ hàng - Xóa giỏ hàng thất bại');
    }
    return deleted;
  }

  async deleteMany(KH_id: number, S_id: number[]): Promise<number> {
    const deleted = await this.GioHangRepo.deleteMany(KH_id, S_id);
    return deleted.deletedCount ?? 0;
  }

  async findUserCarts(KH_id: number): Promise<CartReturn[]> {
    const carts = await this.GioHangRepo.findAll(KH_id);
    const newCart = await this.getCarts(carts);

    const updatedCarts: {
      KH_id: number;
      S_id: number;
      GH_soLuong: number;
    }[] = [];
    const newCartMap = new Map(newCart.map((item) => [item.S_id, item]));

    for (const cart of carts) {
      const matched = newCartMap.get(cart.S_id);

      if (!matched) {
        await this.delete(cart.KH_id, cart.S_id);
      } else if (cart.GH_soLuong !== matched.GH_soLuong) {
        updatedCarts.push({
          KH_id: cart.KH_id,
          S_id: cart.S_id,
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
      .map((c) => c.S_id)
      .filter((id): id is number => id !== undefined);

    const products = await this.SachService.findByIds(productIds);

    if (!products || products.length == 0) return [];
    const result = carts
      .map((cart): any => {
        const product = products.find((p) => p.S_id === cart.S_id);
        if (!product) return null;

        // Số lượng sản phẩm trong giỏ hàng = min(số lượng của cart, số lượng tồn kho)
        let quantity = Math.min(cart.GH_soLuong ?? 0, product.S_tonKho ?? 0);

        // Nếu số lượng trong giỏ là 0 nhưng tồn kho > 0 → phục hồi lại thành 1
        // Sản phẩm trước đó hết hàng, sau lại có hàng
        if ((cart.GH_soLuong ?? 0) === 0 && (product.S_tonKho ?? 0) > 0) {
          quantity = 1;
        }

        return {
          S_id: product.S_id,
          GH_soLuong: quantity,
          GH_thoiGian: cart.GH_thoiGian,
          S_ten: product.S_ten,
          S_giaBan: product.S_giaBan,
          S_giaNhap: product.S_giaNhap,
          S_tonKho: product.S_tonKho,
          S_giaGiam: product.S_giaGiam,
          S_anh: product.S_anh,
          S_trongLuong: product.S_trongLuong,
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
