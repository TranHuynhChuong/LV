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
import { GioHangService, CartReturn } from './gioHang.service';
import { GioHang } from './gioHang.schema';
import { parsePositiveInt } from 'src/Util/convert';

@Controller('/api/carts')
export class GioHangController {
  constructor(private readonly gioHangService: GioHangService) {}

  // Thêm sản phẩm vào giỏ hàng
  @Post()
  async create(
    @Body() dto: { KH_id: number; SP_id: number; GH_soLuong: number }
  ): Promise<CartReturn[]> {
    return this.gioHangService.create(dto);
  }

  // Cập nhật số lượng sản phẩm trong giỏ
  @Put()
  async update(
    @Body() dto: { KH_id: number; SP_id: number; GH_soLuong: number }
  ): Promise<CartReturn[]> {
    return this.gioHangService.update(dto);
  }

  // Xoá sản phẩm khỏi giỏ hàng
  @Delete()
  async delete(
    @Query('KH_id') KH_id: number,
    @Query('SP_id') SP_id: number
  ): Promise<GioHang> {
    return this.gioHangService.delete(KH_id, Number(SP_id));
  }

  @Post('/delete')
  async deleteMultipleItems(@Body() body: { KH_id: number; SP_id: number[] }) {
    const { KH_id, SP_id } = body;
    const deletedCount = await this.gioHangService.deleteMany(KH_id, SP_id);
    return { deletedCount };
  }

  // Lấy danh sách giỏ hàng theo email
  @Get('/:userId')
  async findUserCarts(@Param('userId') userId: string): Promise<CartReturn[]> {
    const parsedId = parsePositiveInt(userId);
    if (parsedId === undefined) {
      throw new Error('Invalid userId');
    }
    return this.gioHangService.findUserCarts(parsedId);
  }

  @Post('/get-carts')
  async getCarts(@Body() carts: Partial<GioHang>[]): Promise<CartReturn[]> {
    return this.gioHangService.getCarts(carts);
  }
}
