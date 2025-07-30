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
import { GioHang } from './schemas/gio-hang.schema';
import { parsePositiveInt } from 'src/Util/convert';
import { CreateGioHangDto } from './dto/create-gio-hang.dto';
import { UpdateGioHangDto } from './dto/update-gio-hang.dto';

@Controller('/api/carts')
export class GioHangController {
  constructor(private readonly GioHangService: GioHangService) {}

  /**
   * Tạo mới một mục giỏ hàng
   * @param dto Thông tin mục giỏ hàng cần tạo.
   * @returns Danh sách giỏ hàng sau khi cập nhật.
   */
  @Post()
  async create(@Body() dto: CreateGioHangDto): Promise<CartReturn[]> {
    return this.GioHangService.create(dto);
  }

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng.
   * @param dto Thông tin mục giỏ hàng cần cập nhật.
   * @returns Danh sách giỏ hàng sau khi cập nhật.
   */
  @Put()
  async update(@Body() dto: UpdateGioHangDto): Promise<CartReturn[]> {
    return this.GioHangService.update(dto);
  }

  /**
   * Xóa một mục giỏ hàng cụ thể theo KH_id và S_id.
   * @param KH_id ID khách hàng.
   * @param S_id ID sản phẩm cần xóa khỏi giỏ.
   * @returns Mục giỏ hàng đã bị xóa.
   */
  @Delete()
  async delete(
    @Query('KH_id') KH_id: number,
    @Query('S_id') S_id: number
  ): Promise<GioHang> {
    return this.GioHangService.delete(KH_id, Number(S_id));
  }

  /**
   * Xóa nhiều mục giỏ hàng cùng lúc theo danh sách S_id.
   * @param body Dữ liệu gồm KH_id và danh sách S_id cần xóa.
   * @returns Số lượng mục đã xóa thành công.
   */
  @Post('/delete')
  async deleteMultipleItems(@Body() body: { KH_id: number; S_id: number[] }) {
    const { KH_id, S_id } = body;
    const deletedCount = await this.GioHangService.deleteMany(KH_id, S_id);
    return { deletedCount };
  }

  /**
   * Lấy toàn bộ giỏ hàng của một người dùng.
   * @param userId ID người dùng.
   * @returns Danh sách các mục trong giỏ hàng của người dùng.
   * @throws Error nếu userId không hợp lệ.
   */
  @Get('/:userId')
  async findUserCarts(@Param('userId') userId: string): Promise<CartReturn[]> {
    const parsedId = parsePositiveInt(userId);
    if (parsedId === undefined) {
      throw new Error('Invalid userId');
    }
    return this.GioHangService.findUserCarts(parsedId);
  }

  /**
   * Lấy danh sách giỏ hàng (gửi vào giỏ hàng - kiểm tra - trả về giỏ hàng với thông tin hiện tại).
   * @param carts Mảng các đối tượng giỏ hàng cần lấy (cần kiểm tra).
   * @returns Danh sách các mục giỏ hàng tương ứng.
   */
  @Post('/get-carts')
  async getCarts(@Body() carts: Partial<GioHang>[]): Promise<CartReturn[]> {
    return this.GioHangService.getCarts(carts);
  }
}
