import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { GioHangRepository } from './repositories/gio-hang.repository';
import { GioHang } from './schemas/gio-hang.schema';
import { SachUtilService } from 'src/sach/sach.service';
import { plainToInstance } from 'class-transformer';
import { GioHangResponseDto } from './dto/response-gio-hang.dto';
import { CreateGioHangDto } from './dto/create-gio-hang.dto';

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

  /**
   * Thêm sách vào giỏ hàng của khách hàng.
   * - Kiểm tra sản phẩm thêm vào giỏ hàng và giỏ hàng.
   * - Nếu KH_id là -1 (khách vãng lai), trả về mảng rỗng (chỉ thực hiện kiểm tra).
   * - Thêm nếu chưa, cập nhật nếu có
   *
   * @param dto Đối tượng chứa thông tin giỏ hàng mới cần tạo:
   *  - KH_id: Mã khách hàng
   *  - S_id: Mã sách cần thêm
   *  - GH_soLuong: Số lượng sách muốn thêm
   * @returns Promise trả về mảng CartReturn chứa thông tin giỏ hàng sau khi thêm/cập nhật
   * @throws ConflictException khi số lượng mục giỏ hàng vượt giới hạn cho phép
   * @throws NotFoundException khi sản phẩm không tồn tại
   * @throws BadRequestException khi cập nhật hoặc tạo mới giỏ hàng thất bại
   */
  async create(dto: CreateGioHangDto): Promise<CartReturn[]> {
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
      return this.checkCarts([updated]);
    }
    const create = await this.GioHangRepo.create(dto);
    if (!create) {
      throw new BadRequestException(
        'Thêm giỏ hàng - Thêm mới giỏi hàng thất bại'
      );
    }
    return this.checkCarts([create]);
  }

  /**
   * Cập nhật số lượng sách trong giỏ hàng của khách hàng.
   *
   * @param param0 Đối tượng chứa:
   *   - KH_id: Mã khách hàng
   *   - S_id: Mã sách trong giỏ hàng
   *   - GH_soLuong: Số lượng mới của sách trong giỏ hàng
   * @returns Mảng CartReturn thể hiện trạng thái giỏ hàng sau cập nhật
   * @throws BadRequestException nếu cập nhật giỏ hàng thất bại
   */
  async update(dto: CreateGioHangDto): Promise<CartReturn[]> {
    const { KH_id, S_id, GH_soLuong } = dto;
    const item = await this.checkCarts([
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

  /**
   * Xóa một mục giỏ hàng của khách hàng theo mã khách hàng và mã sách.
   *
   * @param customerId Mã khách hàng
   * @param bookId Mã sách cần xóa trong giỏ hàng
   * @returns Đối tượng GioHang đã bị xóa
   * @throws BadRequestException nếu xóa thất bại hoặc không tìm thấy mục giỏ hàng
   */
  async delete(customerId: number, bookId: number): Promise<GioHang> {
    const deleted = await this.GioHangRepo.delete(customerId, bookId);
    if (!deleted) {
      throw new BadRequestException('Xóa giỏ hàng - Xóa giỏ hàng thất bại');
    }
    return deleted;
  }

  /**
   * Xóa nhiều sản phẩm khỏi giỏ hàng của một khách hàng.
   *
   * @param customerId Mã khách hàng cần xóa giỏ hàng.
   * @param bookId Danh sách mã sách cần xóa khỏi giỏ hàng.
   * @returns Số lượng bản ghi đã bị xóa.
   */
  async deleteMany(customerId: number, bookId: number[]): Promise<number> {
    const deleted = await this.GioHangRepo.deleteMany(customerId, bookId);
    return deleted.deletedCount ?? 0;
  }

  /**
   * Trả về danh sách giỏ hàng của khách hàng đã được đồng bộ hóa với tồn kho, tồn tại hiện tại.
   *
   * @param id Mã người dùng (Customer ID) cần lấy giỏ hàng.
   * @returns Danh sách giỏ hàng đã được kiểm tra và đồng bộ.
   */
  async findUserCarts(id: number) {
    const carts = await this.GioHangRepo.findAll(id);
    const newCart = await this.checkCarts(carts);
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
    return plainToInstance(GioHangResponseDto, newCart, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Lấy thông tin chi tiết các mục giỏ hàng từ danh sách đầu vào.
   *
   * Nhận vào danh sách giỏ hàng với các thông tin cơ bản
   * đầy đủ của sách tương ứng. Kết quả sẽ được chuẩn hóa để đảm bảo sự tồn tại và số lượng
   * không vượt quá tồn kho, và sắp xếp theo thời gian thêm giỏ hàng giảm dần.
   *
   * @param carts Mảng các mục giỏ hàng cần lấy thông tin chi tiết.
   * @returns Danh sách mục giỏ hàng đã chuẩn hóa và đầy đủ thông tin.
   */
  async checkCarts(carts: Partial<GioHang>[]) {
    const bookds = carts
      .map((c) => c.S_id)
      .filter((id): id is number => id !== undefined);
    const books = await this.SachService.findByIds(bookds);
    if (!books || books.length == 0) return [];
    const result = carts
      .map((cart): any => {
        const book = books.find((b) => b.S_id === cart.S_id);
        if (!book) return null;
        let quantity = Math.min(cart.GH_soLuong ?? 0, book.S_tonKho ?? 0);
        if ((cart.GH_soLuong ?? 0) === 0 && (book.S_tonKho ?? 0) > 0) {
          quantity = 1;
        }
        return {
          S_id: book.S_id,
          GH_soLuong: quantity,
          GH_thoiGian: cart.GH_thoiGian,
          S_ten: book.S_ten,
          S_giaBan: book.S_giaBan,
          S_giaNhap: book.S_giaNhap,
          S_tonKho: book.S_tonKho,
          S_giaGiam: book.S_giaGiam,
          S_anh: book.S_anh,
          S_trongLuong: book.S_trongLuong,
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

  /**
   * Lấy thông tin chi tiết các mục giỏ hàng từ danh sách đầu vào.
   *
   * Nhận vào danh sách giỏ hàng với các thông tin cơ bản
   * đầy đủ của sách tương ứng. Kết quả sẽ được chuẩn hóa để đảm bảo sự tồn tại và số lượng
   * không vượt quá tồn kho, và sắp xếp theo thời gian thêm giỏ hàng giảm dần.
   *
   * @param carts Mảng các mục giỏ hàng cần lấy thông tin chi tiết.
   * @returns Danh sách mục giỏ hàng đã chuẩn hóa và đầy đủ thông tin.
   */
  async getCarts(carts: Partial<GioHang>[]) {
    const result = await this.checkCarts(carts);
    return plainToInstance(GioHangResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
