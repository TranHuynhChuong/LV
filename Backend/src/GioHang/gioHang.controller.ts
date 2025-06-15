import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { GioHangService } from './gioHang.service';
import { GioHang } from './gioHang.schema';

@Controller('/api/carts')
export class GioHangController {
  constructor(private readonly gioHangService: GioHangService) {}

  // Thêm sản phẩm vào giỏ hàng
  @Post()
  async create(
    @Body() dto: { KH_email: string; SP_id: number; GH_soLuong: number }
  ): Promise<GioHang> {
    return this.gioHangService.create(dto);
  }

  // Cập nhật số lượng sản phẩm trong giỏ
  @Put()
  async update(
    @Body() dto: { KH_email: string; SP_id: number; GH_soLuong: number }
  ): Promise<any[]> {
    return this.gioHangService.update(dto);
  }

  // Xoá sản phẩm khỏi giỏ hàng
  @Delete()
  async delete(
    @Query('KH_email') KH_email: string,
    @Query('SP_id') SP_id: number
  ): Promise<GioHang> {
    return this.gioHangService.delete(KH_email, Number(SP_id));
  }

  // Lấy danh sách giỏ hàng theo email
  @Get('/:email')
  async findUserCarts(@Param('email') email: string): Promise<any[]> {
    return this.gioHangService.findUserCarts(email);
  }

  @Post('/get-carts')
  async getCarts(@Body() carts: Partial<GioHang>[]): Promise<any[]> {
    return this.gioHangService.getCarts(carts);
  }
}
