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

  /**
   * Thêm sách vào giỏ hàng của khách hàng.
   *
   * Quy trình:
   * - Kiểm tra số lượng mục giỏ hàng hiện có của khách hàng (nếu có), giới hạn tối đa 99 mục.
   *   Nếu vượt, ném lỗi ConflictException.
   * - Kiểm tra sách cần thêm có tồn tại không, nếu không có ném lỗi NotFoundException.
   * - Nếu KH_id là -1 (khách vãng lai), trả về mảng rỗng (chỉ thực hiện kiểm tra).
   * - Kiểm tra mục giỏ hàng đã tồn tại cho khách hàng và sách đó chưa.
   *   + Nếu đã tồn tại, cộng dồn số lượng và cập nhật, nếu cập nhật thất bại ném lỗi BadRequestException.
   *   + Nếu chưa tồn tại, tạo mới mục giỏ hàng, nếu thất bại ném lỗi BadRequestException.
   * - Cuối cùng trả về mảng CartReturn thể hiện trạng thái giỏ hàng đã cập nhật.
   *
   * @param dto Đối tượng chứa thông tin giỏ hàng mới cần tạo:
   *  - KH_id: Mã khách hàng
   *  - S_id: Mã sách cần thêm
   *  - GH_soLuong: Số lượng sách muốn thêm
   *
   * @returns Promise trả về mảng CartReturn chứa thông tin giỏ hàng sau khi thêm/cập nhật
   * @throws ConflictException khi số lượng mục giỏ hàng vượt giới hạn cho phép
   * @throws NotFoundException khi sản phẩm không tồn tại
   * @throws BadRequestException khi cập nhật hoặc tạo mới giỏ hàng thất bại
   */
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

  /**
   * Cập nhật số lượng sách trong giỏ hàng của khách hàng.
   *
   * Hàm sẽ lấy thông tin giỏ hàng mới từ `getCarts` dựa trên KH_id, S_id và số lượng GH_soLuong.
   * Nếu không có mục giỏ hàng hợp lệ (item.length === 0), sẽ xóa mục giỏ hàng đó.
   * Ngược lại, thực hiện cập nhật số lượng trong database thông qua repository.
   * Nếu cập nhật không thành công, sẽ ném lỗi BadRequestException.
   *
   * @param param0 Đối tượng chứa:
   *   - KH_id: Mã khách hàng
   *   - S_id: Mã sách trong giỏ hàng
   *   - GH_soLuong: Số lượng mới của sách trong giỏ hàng
   * @returns Mảng CartReturn thể hiện trạng thái giỏ hàng sau cập nhật
   * @throws BadRequestException nếu cập nhật giỏ hàng thất bại
   */
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

  /**
   * Xóa một mục giỏ hàng của khách hàng theo mã khách hàng và mã sách.
   *
   * Gọi phương thức xóa trong repository để thực hiện xóa.
   * Nếu không tìm thấy hoặc xóa không thành công, sẽ ném lỗi BadRequestException.
   *
   * @param KH_id Mã khách hàng
   * @param S_id Mã sách cần xóa trong giỏ hàng
   * @returns Đối tượng GioHang đã bị xóa
   * @throws BadRequestException nếu xóa thất bại hoặc không tìm thấy mục giỏ hàng
   */
  async delete(KH_id: number, S_id: number): Promise<GioHang> {
    const deleted = await this.GioHangRepo.delete(KH_id, S_id);
    if (!deleted) {
      throw new BadRequestException('Xóa giỏ hàng - Xóa giỏ hàng thất bại');
    }
    return deleted;
  }

  /**
   * Xóa nhiều sản phẩm khỏi giỏ hàng của một khách hàng.
   *
   * Phương thức này gọi đến repository để xóa các bản ghi giỏ hàng
   * tương ứng với `KH_id` (mã khách hàng) và danh sách `S_id` (mã sách).
   *
   * Nếu không có bản ghi nào bị xóa, sẽ trả về `0`.
   *
   * @param KH_id Mã khách hàng cần xóa giỏ hàng.
   * @param S_id Danh sách mã sách cần xóa khỏi giỏ hàng.
   * @returns Số lượng bản ghi đã bị xóa.
   */
  async deleteMany(KH_id: number, S_id: number[]): Promise<number> {
    const deleted = await this.GioHangRepo.deleteMany(KH_id, S_id);
    return deleted.deletedCount ?? 0;
  }

  /**
   * Trả về danh sách giỏ hàng của khách hàng đã được đồng bộ hóa với tồn kho, tồn tại hiện tại.
   *
   * Phương thức này thực hiện các bước:
   * 1. Lấy toàn bộ giỏ hàng của người dùng.
   * 2. Gọi `getCarts` để chuẩn hóa thông tin từng sản phẩm (bao gồm kiểm tra tồn kho, tồn tại).
   * 3. So sánh danh sách cũ và mới:
   *    - Nếu sản phẩm trong giỏ không còn tồn tại trong kho => xóa khỏi giỏ.
   *    - Nếu số lượng trong giỏ vượt quá tồn kho hiện tại => cập nhật lại số lượng.
   * 4. Nếu có cập nhật số lượng, gọi repository để cập nhật hàng loạt.
   * 5. Trả về danh sách giỏ hàng đã chuẩn hóa.
   *
   * Mục tiêu của hàm là đảm bảo dữ liệu giỏ hàng của người dùng luôn đúng
   * với tồn kho hiện tại và không chứa các sản phẩm không còn khả dụng.
   *
   * @param id Mã người dùng (Customer ID) cần lấy giỏ hàng.
   * @returns Danh sách giỏ hàng đã được kiểm tra và đồng bộ.
   */
  async findUserCarts(id: number): Promise<CartReturn[]> {
    const carts = await this.GioHangRepo.findAll(id);
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

  /**
   * Lấy thông tin chi tiết các mục giỏ hàng từ danh sách đầu vào.
   *
   * Phương thức này nhận vào danh sách giỏ hàng với các thông tin cơ bản
   * đầy đủ của sách tương ứng. Kết quả sẽ được chuẩn hóa để đảm bảo số lượng và tồn tại của sách
   * không vượt quá tồn kho, và sắp xếp theo thời gian thêm giỏ hàng giảm dần.
   *
   * Logic xử lý:
   * - Lọc ra danh sách S_id từ carts đầu vào.
   * - Truy vấn chi tiết sách qua `SachService.findByIds`.
   * - Duyệt từng cart:
   *   + Nếu không tìm thấy sách => bỏ qua.
   *   + Nếu GH_soLuong > S_tonKho => đặt GH_soLuong = S_tonKho.
   *   + Nếu GH_soLuong = 0 và S_tonKho > 0 => đặt GH_soLuong = 1.
   * - Trả về danh sách kết quả đã sắp xếp theo thời gian thêm giỏ hàng (mới nhất trước).
   *
   * @param carts Mảng các mục giỏ hàng cần lấy thông tin chi tiết.
   * @returns Danh sách mục giỏ hàng đã chuẩn hóa và đầy đủ thông tin.
   */
  async getCarts(carts: Partial<GioHang>[]): Promise<CartReturn[]> {
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
}
