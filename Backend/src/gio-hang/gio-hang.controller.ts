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
import { plainToInstance } from 'class-transformer';

@Controller('/api/carts')
export class GioHangController {
  constructor(private readonly GioHangService: GioHangService) {}

  /**
   * Tạo mới một mục giỏ hàng
   *
   * @param dto Thông tin mục giỏ hàng cần tạo.
   * @returns Danh sách giỏ hàng sau khi cập nhật.
   */
  @Post()
  async create(@Body() carts: CreateGioHangDto): Promise<CartReturn[]> {
    return this.GioHangService.create(carts);
  }

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng.
   *
   * @param dto Thông tin mục giỏ hàng cần cập nhật.
   * @returns Danh sách giỏ hàng sau khi cập nhật.
   */
  @Put()
  async update(@Body() carts: UpdateGioHangDto): Promise<CartReturn[]> {
    return this.GioHangService.update(carts);
  }

  /**
   * Xóa một mục giỏ hàng cụ thể theo customerId và bookId.
   *
   * @param customerId ID khách hàng.
   * @param bookId ID sản phẩm cần xóa khỏi giỏ.
   * @returns Mục giỏ hàng đã bị xóa.
   */
  @Delete()
  async delete(
    @Query('customerId') customerId: number,
    @Query('bookId') bookId: number
  ): Promise<GioHang> {
    return this.GioHangService.delete(customerId, Number(bookId));
  }

  /**
   * Xóa nhiều mục giỏ hàng cùng lúc theo danh sách bookId.
   *
   * @param body Dữ liệu gồm customerId và danh sách bookId cần xóa.
   * @returns Số lượng mục đã xóa thành công.
   */
  @Post('/delete')
  async deleteMultipleItems(
    @Body() body: { customerId: number; bookId: number[] }
  ) {
    const { customerId, bookId } = body;
    const deletedCount = await this.GioHangService.deleteMany(
      customerId,
      bookId
    );
    return { deletedCount };
  }

  /**
   * Lấy toàn bộ giỏ hàng của một người dùng.
   *
   * @param userId ID người dùng.
   * @returns Danh sách các mục trong giỏ hàng của người dùng.
   * @throws Error nếu userId không hợp lệ.
   */
  @Get('/:userId')
  async findUserCarts(@Param('userId') userId: string) {
    const parsedId = parsePositiveInt(userId);
    if (parsedId === undefined) {
      throw new Error('Invalid userId');
    }
    return this.GioHangService.findUserCarts(parsedId);
  }

  /**
   * Lấy danh sách giỏ hàng (gửi vào giỏ hàng - kiểm tra - trả về giỏ hàng với thông tin hiện tại).
   *
   * @param carts Mảng các đối tượng giỏ hàng cần lấy (cần kiểm tra).
   * @returns Danh sách các mục giỏ hàng tương ứng.
   */
  @Post('/get-carts')
  async getCarts(@Body() carts: CreateGioHangDto[]) {
    const dto = plainToInstance(CreateGioHangDto, carts);
    return this.GioHangService.getCarts(dto);
  }
}
