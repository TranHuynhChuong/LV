import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { GioHangRepository } from './gioHang.repository';
import { GioHang } from './gioHang.schema';
import { SanPhamService } from 'src/SanPham/sanPham.service';

@Injectable()
export class GioHangService {
  constructor(
    private readonly repo: GioHangRepository,
    private readonly SanPham: SanPhamService
  ) {}

  async create(dto: {
    KH_email: string;
    SP_id: number;
    GH_soLuong: number;
  }): Promise<GioHang> {
    try {
      return await this.repo.create(dto);
    } catch (err) {
      if (err.code === 11000) {
        throw new ConflictException();
      }
      throw err;
    }
  }

  async update(dto: {
    KH_email: string;
    SP_id: number;
    GH_soLuong: number;
  }): Promise<GioHang> {
    const updated = await this.repo.update(
      dto.KH_email,
      dto.SP_id,
      dto.GH_soLuong
    );

    if (!updated) {
      throw new NotFoundException();
    }

    return updated;
  }

  async delete(KH_email: string, SP_id: number): Promise<GioHang> {
    const deleted = await this.repo.delete(KH_email, SP_id);
    if (!deleted) {
      throw new NotFoundException();
    }
    return deleted;
  }

  async findUserCarts(KH_email: string): Promise<any[]> {
    const carts = await this.repo.findAllByEmail(KH_email);
    return this.getCarts(carts);
  }

  async getCarts(carts: Partial<GioHang>[]): Promise<any[]> {
    const productIds = carts
      .map((c) => c.SP_id)
      .filter((id): id is number => id !== undefined);

    const { products, promotions } = await this.SanPham.findByIds(productIds);

    const result = carts
      .map((cart) => {
        const product = products.find((p) => p.SP_id === cart.SP_id);
        if (!product) return null; // ❌ Không có sản phẩm

        if (product.SP_tonKho === 0) return null; // ❌ Hết hàng

        const quantity = Math.min(cart.GH_soLuong ?? 0, product.SP_tonKho ?? 0);
        if (quantity <= 0) return null; // ❌ Không còn số lượng phù hợp

        const promo = promotions.find(
          (km) => km.SP_id === cart.SP_id && !km.CTKM_tamNgung
        );

        let giaGiam = product.SP_giaBan;
        if (promo) {
          if (promo.CTKM_theoTyLe) {
            giaGiam = (product.SP_giaBan ?? 0) * (1 - promo.CTKM_giaTri / 100);
          } else {
            giaGiam = (product.SP_giaBan ?? 0) - promo.CTKM_giaTri;
          }
          if (giaGiam < 0) giaGiam = 0;
        }

        return {
          ...cart,
          ...product,
          GH_soLuong: quantity, // ✅ số lượng đã được giới hạn
          SP_giaGiam: Math.floor(giaGiam ?? 0),
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
