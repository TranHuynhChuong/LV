import { Injectable, BadRequestException } from '@nestjs/common';
import { GioHangRepository } from './gioHang.repository';
import { GioHang } from './gioHang.schema';
import { SanPhamUtilService } from 'src/SanPham/sanPham.service';

@Injectable()
export class GioHangService {
  constructor(
    private readonly GioHang: GioHangRepository,
    private readonly SanPham: SanPhamUtilService
  ) {}

  async create(dto: {
    KH_id: string;
    SP_id: number;
    GH_soLuong: number;
  }): Promise<GioHang> {
    const { KH_id, SP_id, GH_soLuong } = dto;

    const existing = await this.GioHang.findOne(KH_id, SP_id);

    if (existing) {
      const newQuantity = existing.GH_soLuong + GH_soLuong;
      const updated = await this.GioHang.update({
        KH_id,
        SP_id,
        GH_soLuong: newQuantity,
      });
      if (!updated) {
        throw new BadRequestException();
      }
      return updated;
    }

    return this.GioHang.create(dto);
  }

  async update(dto: {
    KH_id: string;
    SP_id: number;
    GH_soLuong: number;
  }): Promise<any[]> {
    const item = await this.getCarts([dto]);
    console.log(item);
    if (item.length === 0) {
      await this.delete(dto.KH_id, dto.SP_id);
    } else {
      const updated = await this.GioHang.update(item[0]);
      if (!updated) {
        throw new BadRequestException();
      }
    }
    return item;
  }

  async delete(KH_id: string, SP_id: number): Promise<GioHang> {
    const deleted = await this.GioHang.delete(KH_id, SP_id);
    if (!deleted) {
      throw new BadRequestException();
    }
    return deleted;
  }

  async findUserCarts(KH_id: string): Promise<any[]> {
    const carts = await this.GioHang.findAllByEmail(KH_id);
    return this.getCarts(carts);
  }

  async getCarts(carts: Partial<GioHang>[]): Promise<any[]> {
    const productIds = carts
      .map((c) => c.SP_id)
      .filter((id): id is number => id !== undefined);

    const products = await this.SanPham.findByIds(productIds);

    const result = carts
      .map((cart): any => {
        const product = products.find((p) => p.SP_id === cart.SP_id);
        if (!product) return null; // ❌ Không có sản phẩm

        if (product.SP_tonKho === 0) return null; // ❌ Hết hàng

        const quantity = Math.min(cart.GH_soLuong ?? 0, product.SP_tonKho ?? 0);
        if (quantity <= 0) return null; // ❌ Không còn số lượng phù hợp

        return {
          ...cart,
          ...product,
          GH_soLuong: quantity, // ✅ số lượng đã được giới hạn
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (!a || !b) return 0;
        const aTime = a.GH_thoiGian ? new Date(a.GH_thoiGian).getTime() : 0;
        const bTime = b.GH_thoiGian ? new Date(b.GH_thoiGian).getTime() : 0;
        return bTime - aTime;
      });

    return result;
  }
}
