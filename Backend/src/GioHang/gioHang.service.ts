import { Injectable, BadRequestException } from '@nestjs/common';
import { GioHangRepository } from './gioHang.repository';
import { GioHang } from './gioHang.schema';
import { SanPhamUtilService } from 'src/SanPham/sanPham.service';

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
    private readonly GioHang: GioHangRepository,
    private readonly SanPham: SanPhamUtilService
  ) {}

  async create(dto: {
    KH_id: number;
    SP_id: number;
    GH_soLuong: number;
  }): Promise<CartReturn[]> {
    const { KH_id, SP_id, GH_soLuong } = dto;

    const existing = await this.GioHang.findOne(KH_id, SP_id);

    if (existing) {
      const newQuantity = existing.GH_soLuong + GH_soLuong;
      const updated = await this.GioHang.update(KH_id, SP_id, newQuantity);
      if (!updated) {
        throw new BadRequestException();
      }
      return this.getCarts([updated]);
    }
    const create = await this.GioHang.create(dto);
    if (!create) {
      throw new BadRequestException();
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
      const updated = await this.GioHang.update(
        KH_id,
        SP_id,
        item[0].GH_soLuong
      );

      if (!updated) {
        throw new BadRequestException();
      }
    }
    return item;
  }

  async delete(KH_id: number, SP_id: number): Promise<GioHang> {
    const deleted = await this.GioHang.delete(KH_id, SP_id);
    if (!deleted) {
      throw new BadRequestException();
    }
    return deleted;
  }

  async deleteMany(KH_id: number, SP_id: number[]): Promise<number> {
    const deleted = await this.GioHang.deleteMany(KH_id, SP_id);
    return deleted.deletedCount ?? 0;
  }

  async findUserCarts(KH_id: number): Promise<CartReturn[]> {
    const carts = await this.GioHang.findAllUser(KH_id);
    return this.getCarts(carts);
  }

  async getCarts(carts: Partial<GioHang>[]): Promise<CartReturn[]> {
    const productIds = carts
      .map((c) => c.SP_id)
      .filter((id): id is number => id !== undefined);

    const products = await this.SanPham.findByIds(productIds);

    if (!products || products.length == 0) return [];
    const result = carts
      .map((cart): any => {
        const product = products.find((p) => p.SP_id === cart.SP_id);
        if (!product) return null; // ❌ Không có sản phẩm

        if (product.SP_tonKho === 0) return null; // ❌ Hết hàng

        const quantity = Math.min(cart.GH_soLuong ?? 0, product.SP_tonKho ?? 0);
        if (quantity <= 0) return null; // ❌ Không còn số lượng phù hợp

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
