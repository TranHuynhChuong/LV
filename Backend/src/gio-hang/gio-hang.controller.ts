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
import { GioHangService, CartReturn } from './gio-hang.service';
import { GioHang } from './schemas/gioHang.schema';
import { parsePositiveInt } from 'src/Util/convert';
import { CreateGioHangDto } from './dto/create-gio-hang.dto';
import { UpdateGioHangDto } from './dto/update-gio-hang.dto';

@Controller('/api/carts')
export class GioHangController {
  constructor(private readonly GioHangService: GioHangService) {}

  // Thêm sản phẩm vào giỏ hàng
  @Post()
  async create(@Body() dto: CreateGioHangDto): Promise<CartReturn[]> {
    return this.GioHangService.create(dto);
  }

  // Cập nhật số lượng sản phẩm trong giỏ
  @Put()
  async update(@Body() dto: UpdateGioHangDto): Promise<CartReturn[]> {
    return this.GioHangService.update(dto);
  }

  // Xoá sản phẩm khỏi giỏ hàng
  @Delete()
  async delete(
    @Query('KH_id') KH_id: number,
    @Query('SP_id') SP_id: number
  ): Promise<GioHang> {
    return this.GioHangService.delete(KH_id, Number(SP_id));
  }

  @Post('/delete')
  async deleteMultipleItems(@Body() body: { KH_id: number; SP_id: number[] }) {
    const { KH_id, SP_id } = body;
    const deletedCount = await this.GioHangService.deleteMany(KH_id, SP_id);
    return { deletedCount };
  }

  // Lấy danh sách giỏ hàng theo email
  @Get('/:userId')
  async findUserCarts(@Param('userId') userId: string): Promise<CartReturn[]> {
    const parsedId = parsePositiveInt(userId);
    if (parsedId === undefined) {
      throw new Error('Invalid userId');
    }
    return this.GioHangService.findUserCarts(parsedId);
  }

  @Post('/get-carts')
  async getCarts(@Body() carts: Partial<GioHang>[]): Promise<CartReturn[]> {
    return this.GioHangService.getCarts(carts);
  }
}
