import { ZaloPayService } from './../thanh-toan/services/zalo-pay.service';
import { ThanhToanService } from './../thanh-toan/services/thanh-toan.service';
import { DanhGiaServiceUtil } from './../danh-gia/danh-gia.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';
import { MaGiamUtilService } from 'src/ma-giam/ma-giam.service';
import { NhanVienUtilService } from 'src/nguoi-dung/nhan-vien/nhan-vien.service';
import { SachUtilService } from 'src/sach/sach.service';
import { TTNhanHangDHService } from '../tt-nhan-hang/tt-nhan-hang.service';
import { CheckDto, CreateDto } from './dto/create-don-hang.dto';
import {
  DonHangRepository,
  OrderStatus,
} from './repositories/don-hang.repository';
import { EmailService } from 'src/Util/email.service';
import { KhachHangUtilService } from 'src/nguoi-dung/khach-hang/khach-hang.service';
import { ExportService, SheetData } from 'src/Util/export';
import { ChiTietDonHangRepository } from './repositories/chi-tiet-don-hang.repository';
import { TrangThaiDonHang } from './schemas/don-hang.schema';
import {
  StatsResult,
  OrderStatsByDate,
  DiscountedProductStats,
  VoucherStats,
  OrderDetailStats,
} from './interfaces/don-hang-thong-ke.interface';
import { DiaChiService } from 'src/dia-chi/dia-chi.service';
import { getNextSequence } from 'src/Util/counter.service';
import * as moment from 'moment';
import { LichSuThaoTacService } from 'src/lich-su-thao-tac/lich-su-thao-tac.service';
import { DULIEU } from 'src/lich-su-thao-tac/schemas/lich-su-thao-tac.schema';
import { DonHangResponseDto } from './dto/response-don-hang.dto';
import { plainToInstance } from 'class-transformer';
@Injectable()
export class DonHangService {
  constructor(
    private readonly ExportService: ExportService,
    private readonly EmailService: EmailService,
    private readonly KhachHangService: KhachHangUtilService,
    @InjectConnection() private readonly connection: Connection,
    private readonly SachService: SachUtilService,
    private readonly NhanVienService: NhanVienUtilService,
    private readonly MaGiamService: MaGiamUtilService,
    private readonly NhanHangDHService: TTNhanHangDHService,
    private readonly DanhGiaServiceUtil: DanhGiaServiceUtil,
    private readonly DiaChiService: DiaChiService,
    private readonly DonHangRepo: DonHangRepository,
    private readonly ChiTietDonHangRepo: ChiTietDonHangRepository,
    private readonly ThanhToanService: ThanhToanService,
    private readonly ZaloPayService: ZaloPayService,
    private readonly LichSuThaoTacService: LichSuThaoTacService
  ) {}

  /**
   * Kiểm tra tính hợp lệ của đơn hàng.
   *
   * @param data - Dữ liệu đơn hàng để kiểm tra.
   * @param session - Phiên giao dịch MongoDB sử dụng để đảm bảo tính nhất quán khi đọc dữ liệu.
   * @returns Kết quả kiểm tra hợp lệ.
   */
  async checkValid(data: CheckDto): Promise<{
    errors: number[];
    products: any[];
    vouchers: any[];
  }> {
    const detail = data.CTDH;
    const ids = detail.map((item) => item.S_id);
    const voucherIds = data.MG?.map((item) => item.MG_id) || [];
    const books = await this.SachService.findByIds(ids);
    const vouchers = await this.MaGiamService.findValidByIds(voucherIds);
    const booksMap = new Map(books.map((b) => [b.S_id, b]));
    const errorCodes = new Set<number>();

    for (const item of detail) {
      const b = booksMap.get(item.S_id);
      if (!b) {
        errorCodes.add(1001); // Sách không tồn tại hoặc ẩn
        continue;
      }
      if (item.CTDH_soLuong > b.S_tonKho) {
        errorCodes.add(1002); // Không đủ tồn kho
      }
      const priceHasChange = item.CTDH_giaMua !== (b.S_giaGiam ?? b.S_giaBan); // nếu có giảm giá
      if (priceHasChange) {
        errorCodes.add(1003); // Giá thay đổi
      }
    }
    const validVoucherSet = new Set(vouchers.map((m) => m.MG_id));
    const invalidMG = voucherIds.filter((id) => !validVoucherSet.has(id));
    if (invalidMG.length > 0) {
      errorCodes.add(2001); // Mã giảm không hợp lệ
    }
    return {
      errors: [...errorCodes],
      products: books, // Trả về danh sách sản phẩm đã fetch
      vouchers: vouchers,
    };
  }

  /**
   * Sinh mã đơn hàng tiếp theo.
   * Mã có định dạng: <PREFIX><SỐ>, ví dụ: "AAA000000001"
   * Nếu đã đạt đến "ZZZ999999999" → ném lỗi.
   *
   * @returns Mã đơn hàng mới.
   * @throws Error nếu không thể sinh tiếp mã đơn hàng vì đã vượt giới hạn định dạng.
   */
  private async generateNextOrderId(session?: ClientSession): Promise<string> {
    if (!this.connection.db) {
      throw new Error('Không thể kết nối cơ sở dữ liệu');
    }
    // Lấy giá trị seq tự tăng từ MongoDB
    const seq = await getNextSequence(this.connection.db, 'orderId', session);
    // Giới hạn seq nằm trong khoảng cho phép
    const maxPerPrefix = 999_999_999;
    const maxSeq = 26 * 26 * 26 * maxPerPrefix; // = 17,575,999,982,424
    if (seq < 1 || seq > maxSeq) {
      throw new Error('Giá trị seq vượt quá giới hạn cho phép.');
    }
    // Tính chỉ số prefix (AAA → ZZZ)
    const prefixIndex = Math.floor((seq - 1) / maxPerPrefix);
    const numberPart = ((seq - 1) % maxPerPrefix) + 1;
    const aCode = 'A'.charCodeAt(0);
    const firstChar = String.fromCharCode(
      aCode + Math.floor(prefixIndex / (26 * 26))
    );
    const secondChar = String.fromCharCode(
      aCode + Math.floor((prefixIndex % (26 * 26)) / 26)
    );
    const thirdChar = String.fromCharCode(aCode + (prefixIndex % 26));
    const prefix = `${firstChar}${secondChar}${thirdChar}`;
    const numberStr = numberPart.toString().padStart(9, '0');
    // Trả về mã đơn hàng có dạng như AAA000000001
    return `${prefix}${numberStr}`;
  }

  /**
   * Kiểm tra tính hợp lệ của thông tin khách hàng khi tạo đơn hàng.
   *
   * - Nếu không có cả `id` và `email` → ném lỗi vì đơn hàng không có chủ sở hữu.
   * - Nếu có đồng thời cả `id` và `email` → ném lỗi vì đơn hàng có nhiều chủ sở hữu.
   *
   * @param email - Email của khách (nếu là khách vãng lai).
   * @param id - ID khách hàng thành viên (nếu đã đăng ký).
   * @throws ConflictException nếu thông tin khách hàng không hợp lệ.
   */
  private validateCustomerInf(email?: string, id?: number) {
    if (!id && !email) {
      throw new ConflictException(
        'Tạo đơn hàng - Đơn hàng không có chủ sở hữu'
      );
    }
    if (id && email) {
      throw new ConflictException(
        'Tạo đơn hàng - Đơn hàng có nhiều chủ sở hữu'
      );
    }
  }

  /**
   * Tính tổng tiền đơn hàng dựa trên danh sách chi tiết đơn hàng.
   *
   * Tổng tiền được tính bằng cách cộng dồn (giá mua × số lượng) của từng sản phẩm trong đơn hàng.
   *
   * @param data - Dữ liệu đầu vào để tạo đơn hàng, bao gồm danh sách chi tiết đơn hàng (`CTDH`).
   * @returns Tổng số tiền của đơn hàng (đơn vị: số nguyên, thường là VNĐ).
   */
  private calculateTotalAmount(data: CreateDto): number {
    return data.DH.CTDH.reduce(
      (sum, item) => sum + item.CTDH_giaMua * item.CTDH_soLuong,
      0
    );
  }

  /**
   * Tính tổng số tiền giảm giá cho đơn hàng bao gồm:
   * - Giảm trên tổng hóa đơn (DH_giamHD)
   * - Giảm phí vận chuyển (DH_giamVC)
   *
   * Hàm sẽ lọc ra các mã giảm giá hợp lệ và áp dụng theo điều kiện từng loại:
   * - Nếu là loại `'hd'` (hóa đơn), giảm theo tỷ lệ (%) hoặc số tiền cố định nếu tổng tiền sản phẩm thỏa điều kiện.
   * - Nếu là loại `'vc'` (vận chuyển), giảm theo phí vận chuyển của đơn hàng.
   *
   * @param data - Dữ liệu tạo đơn hàng chứa thông tin mã giảm giá và đơn hàng.
   * @param totalProductPrice - Tổng tiền của tất cả sản phẩm trong đơn hàng (chưa giảm giá).
   * @returns Một đối tượng gồm hai giá trị:
   * - `DH_giamHD`: Tổng tiền giảm trên hóa đơn.
   * - `DH_giamVC`: Tổng tiền giảm trên phí vận chuyển.
   */
  private async calculateDiscount(data: CreateDto, totalProductPrice: number) {
    const validMGs = await this.MaGiamService.findValidByIds(
      data.MG?.map((m) => m.MG_id) || []
    );
    let DH_giamHD = 0;
    let DH_giamVC = 0;
    for (const mg of validMGs) {
      if (mg.MG_loai === 'hd') {
        if (totalProductPrice >= (mg.MG_toiThieu || 0)) {
          const giam = mg.MG_theoTyLe
            ? (totalProductPrice * mg.MG_giaTri) / 100
            : mg.MG_giaTri;
          DH_giamHD += mg.MG_toiDa ? Math.min(giam, mg.MG_toiDa) : giam;
        }
      } else if (mg.MG_loai === 'vc') {
        const giam = mg.MG_theoTyLe
          ? (data.DH.DH_phiVC * mg.MG_giaTri) / 100
          : mg.MG_giaTri;
        DH_giamVC += mg.MG_toiDa ? Math.min(giam, mg.MG_toiDa) : giam;
      }
    }
    return { DH_giamHD, DH_giamVC };
  }

  /**
   * Tạo mới một đơn hàng
   *
   * @param data Dữ liệu tạo đơn hàng
   */
  private async createOrder(
    data: CreateDto,
    context: {
      DH_id: string;
      DH_giamHD: number;
      DH_giamVC: number;
      now: Date;
      session: ClientSession;
    }
  ) {
    const result = await this.DonHangRepo.create(
      {
        DH_id: context.DH_id,
        DH_ngayTao: context.now,
        DH_ngayCapNhat: context.now,
        DH_giamHD: context.DH_giamHD,
        DH_giamVC: context.DH_giamVC,
        DH_phiVC: data.DH.DH_phiVC,
        DH_trangThai: TrangThaiDonHang.ChoXacNhan,
        KH_id: data.DH.KH_id,
        KH_email: data.DH.KH_email,
        DH_HD: data.HD
          ? {
              ...data.HD,
            }
          : undefined,
      },
      context.session
    );
    if (!result)
      throw new BadRequestException('Tạo đơn hàng - Tạo đơn hàng thất bại');
    return result;
  }

  /**
   * Quy trình tạo đơn hàng
   *
   * @param data Dữ liệu tạo đơn hàng
   */
  async create(data: CreateDto) {
    const session = await this.connection.startSession();
    let order_url = '';
    let total = 0;
    let orderId = '';
    let transId = '';
    try {
      await session.withTransaction(async () => {
        // B1: Kiểm tra dữ liệu đầu vào
        const { errors } = await this.checkValid({
          CTDH: data.DH.CTDH,
          MG: data.MG,
        });
        if (errors.length > 0) {
          throw new ConflictException(errors);
        }
        // B2 Tạo mã đơn hàng
        const DH_id = await this.generateNextOrderId(session);
        orderId = DH_id;
        const now = new Date();
        // B3 Tính tổng tiền sản phẩm - để tính giá giảm nếu có dùng mã giảm
        const totalProductPrice = this.calculateTotalAmount(data);
        // B4 Tính giá giảm khi dùng mã giảm
        const { DH_giamHD, DH_giamVC } = await this.calculateDiscount(
          data,
          totalProductPrice
        );
        // B5 Check KH_id/KH_email và tạo đơn hàng;
        this.validateCustomerInf(data.DH.KH_email, data.DH.KH_id);
        await this.createOrder(data, {
          DH_id,
          DH_giamHD,
          DH_giamVC,
          now,
          session,
        });
        // B6. Tạo thông tin nhận đơn hàng
        await this.NhanHangDHService.create({ DH_id, ...data.NH }, session);
        // B7. Tạo chi tiết đơn hàng
        await this.ChiTietDonHangRepo.create(DH_id, data.DH.CTDH, session);
        // B8. Tạo mã giảm đơn hàng nếu có
        const magiamIds = data.MG?.map((m) => m.MG_id) ?? [];
        if (magiamIds.length > 0) {
          await this.MaGiamService.createVoucherForOrder(
            DH_id,
            magiamIds,
            session
          );
        }
        // B9.  Cập nhật đã bán và tồn kho
        const updates = data.DH.CTDH.map((item) => ({
          id: item.S_id,
          sold: item.CTDH_soLuong,
        }));
        await this.SachService.updateSold(updates, session);
        // B10. Gửi email thông báo đơn hàng đã tạo thành công
        let email = data.DH.KH_email;
        if (!email && data.DH.KH_id) {
          email = await this.KhachHangService.getEmail(data.DH.KH_id);
        }
        if (!email) throw new BadRequestException();
        this.EmailService.sendOrderCreatetion(email, DH_id);
        total = totalProductPrice + data.DH.DH_phiVC - DH_giamHD - DH_giamVC;
        // Tạo document thanh toán nếu có
        if (data.PhuongThucThanhToan === 'ZaloPay' && data.DH.KH_id) {
          transId = `${moment().format('YYMMDDHHmmssSSS')}${orderId}`;
          await this.ThanhToanService.create(orderId, transId, session);
        }
      });
      if (data.PhuongThucThanhToan === 'ZaloPay' && data.DH.KH_id) {
        try {
          const result = await this.ZaloPayService.create(
            orderId,
            transId,
            total,
            data.DH.KH_id
          );
          order_url = result.order_url;
        } catch {
          throw new BadRequestException([4001]);
        }
      }
      return order_url;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new InternalServerErrorException(`Tạo đơn hàng - ${error.message}`);
    } finally {
      await session.endSession();
    }
  }

  /**
   * Gửi email thông báo cho khách hàng dựa trên trạng thái đơn hàng.
   *
   * - Nếu đơn hàng hoàn tất → Gửi email thông báo vận chuyển.
   * - Nếu đơn hàng bị hủy → Gửi email xác nhận hủy đơn.
   *
   * @param status - Trạng thái hiện tại của đơn hàng (Complete, Canceled, ...)
   * @param email - Địa chỉ email của khách hàng cần gửi thông báo
   * @param orderId - Mã đơn hàng liên quan đến thông báo
   */
  private notifyEmailStatus(
    status: OrderStatus,
    email: string,
    orderId: string
  ) {
    switch (status) {
      case OrderStatus.Complete:
        this.EmailService.sendShippingNotification(email, orderId);
        break;
      case OrderStatus.Canceled:
        this.EmailService.sendOrderConfirmCancel(email, orderId);
        break;
    }
  }

  /**
   * Cập nhật trạng thái của đơn hàng, ghi nhận thao tác, gửi email và cập nhật tồn kho khi hủy.
   *
   * @param id - Mã đơn hàng cần cập nhật
   * @param newStatus - Trạng thái đơn hàng mới (ví dụ: Shipping, Complete, Canceled,...)
   * @param staffId - (Tùy chọn) ID nhân viên thực hiện thao tác cập nhật
   * @returns Đơn hàng đã được cập nhật
   * @throws NotFoundException nếu không tìm thấy đơn hàng hoặc khách hàng
   * @throws BadRequestException nếu cập nhật không thành công
   * @throws InternalServerErrorException nếu có lỗi khác xảy ra trong quá trình xử lý
   */
  async update(id: string, newStatus: OrderStatus, staffId?: string) {
    const statusActionMap: Record<string, string> = {
      [OrderStatus.ToShip]: 'Xác nhận đơn hàng',
      [OrderStatus.Shipping]: 'Vận chuyển đơn hàng',
      [OrderStatus.Complete]: 'Giao hàng thành công',
      [OrderStatus.InComplete]: 'Giao hàng thất bại',
      [OrderStatus.CancelRequest]: 'Yêu cầu hủy đơn hàng',
      [OrderStatus.Canceled]: 'Đơn hàng đã được hủy',
    };
    const thaoTac = statusActionMap[newStatus];
    if (!thaoTac) return null;
    const session = await this.connection.startSession();
    try {
      const result = await session.withTransaction(async () => {
        // Tìm đơn hàng theo ID
        const order = await this.DonHangRepo.getById(id);
        if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
        // Lấy email khách hàng từ đơn hàng hoặc từ thông tin khách hàng liên kết
        let email = order.KH_email;
        if (!email && order.KH_id) {
          email = await this.KhachHangService.getEmail(order.KH_id);
        }
        if (!email) throw new NotFoundException('Khách hàng không tồn tại');
        // Gửi email thông báo theo trạng thái mới
        this.notifyEmailStatus(newStatus, email, order.DH_id);

        await this.LichSuThaoTacService.create({
          actionType: thaoTac,
          staffId: staffId ?? '',
          dataName: DULIEU.ORDER,
          dataId: id,
          session: session,
        });

        // Cập nhật trạng thái đơn hàng và ghi lịch sử thao tác
        const result = await this.DonHangRepo.update(id, newStatus, session);
        if (!result)
          throw new BadRequestException('Cập nhật đơn hàng thất bại');
        // Nếu trạng thái là "Đã hủy" thì cập nhật lại tồn kho và số lượng bán
        if (newStatus === OrderStatus.Canceled) {
          const orderDetails = await this.ChiTietDonHangRepo.findByOrderId(id);
          const updates = orderDetails.map((item) => ({
            id: item.S_id,
            sold: -item.CTDH_soLuong,
            stock: item.CTDH_soLuong,
          }));
          await this.SachService.updateSold(updates, session);
        }
        return result;
      });
      return result;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new InternalServerErrorException(
        `Cập nhật đơn hàng - ${error.message}`
      );
    } finally {
      await session.endSession();
    }
  }

  /**
   * Tìm đơn hàng theo ID và (tùy chọn) trạng thái lọc.
   * Đồng thời bổ sung lịch sử thao tác nhân viên, thông tin người nhận, và email khách hàng nếu thiếu.
   *
   * @param id - Mã đơn hàng cần tìm
   * @param filterType - (Tùy chọn) Trạng thái đơn hàng cần lọc
   * @returns Thông tin đơn hàng đầy đủ
   * @throws NotFoundException nếu không tìm thấy đơn hàng
   */
  async findById(id: string, filterType?: OrderStatus): Promise<any> {
    const result = await this.DonHangRepo.findById(id, filterType);
    if (!result) {
      throw new NotFoundException('Tìm đơn hàng - Đơn hàng không tồn tại');
    }

    // Nếu email khách hàng bị thiếu, cố gắng truy vấn bằng KH_id
    if ((!result.KH_email || result.KH_email === '') && result.KH_id) {
      result.KH_email = await this.KhachHangService.getEmail(result.KH_id);
    }
    // Lấy thông tin người nhận hàng theo đơn hàng
    result.thongTinNhanHang = await this.NhanHangDHService.findByDHId(
      result.DH_id
    );
    const payment = await this.ZaloPayService.queryOrder(result.DH_id);
    if (payment !== null) {
      result.DH_thanhToan = payment;
    }

    result.lichSuThaoTac = await this.LichSuThaoTacService.findByReference(
      id,
      'DonHang'
    );
    return plainToInstance(DonHangResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Tìm kiếm đơn hàng theo mã đơn hàng.
   * Loại bỏ các trường không cần thiết và bổ sung thông tin người nhận hàng.
   *
   * @param id - Mã đơn hàng cần tìm
   * @returns Thông tin đơn hàng rút gọn hoặc null nếu không tìm thấy
   */
  async searchOrder(id: string): Promise<any> {
    const result = await this.DonHangRepo.findById(id);
    if (!result) return null;
    delete result.DH_HD;
    return plainToInstance(DonHangResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Truy vấn danh sách đơn hàng với phân trang và các tùy chọn lọc.
   *
   * @param options - Các tùy chọn lọc và phân trang:
   * - page: Trang cần lấy
   * - limit: Số lượng bản ghi mỗi trang (mặc định là 12)
   * - filterType: Trạng thái đơn hàng cần lọc (nếu có)
   * - orderId: Mã đơn hàng cần tìm (nếu có)
   * - from: Ngày bắt đầu (lọc theo thời gian tạo đơn, nếu có)
   * - to: Ngày kết thúc (lọc theo thời gian tạo đơn, nếu có)
   * - userId: ID khách hàng (nếu có)
   * @returns Danh sách đơn hàng phù hợp theo trang và tiêu chí lọc, đã loại bỏ lịch sử thao tác và thông tin nhận hàng
   */
  async findAll(options: {
    page: number;
    limit: number;
    filterType?: OrderStatus;
    orderId?: string;
    from?: Date;
    to?: Date;
    userId?: number;
  }) {
    const { page, limit = 12, filterType, orderId, from, to, userId } = options;
    const { paginationInfo, data } = await this.DonHangRepo.findAll({
      page: page,
      limit: limit,
      filterType: filterType,
      orderId,
      from,
      to,
      userId: userId,
    });
    return {
      data: plainToInstance(DonHangResponseDto, data, {
        excludeExtraneousValues: true,
      }),
      paginationInfo,
    };
  }

  /**
   * Đếm số lượng đơn hàng theo từng trạng thái trong khoảng thời gian chỉ định.
   *
   * @param from - Ngày bắt đầu (tùy chọn). Nếu không cung cấp, sẽ tính từ thời điểm sớm nhất.
   * @param to - Ngày kết thúc (tùy chọn). Nếu không cung cấp, sẽ tính đến thời điểm hiện tại.
   * @returns Một đối tượng chứa tổng số đơn hàng và số lượng đơn hàng theo từng trạng thái:
   * - total: Tổng số đơn hàng
   * - pending: Chờ xử lý
   * - toShip: Đã xác nhận, chờ giao hàng
   * - shipping: Đang vận chuyển
   * - complete: Giao hàng thành công
   * - inComplete: Giao hàng thất bại
   * - cancelRequest: Đơn hàng có yêu cầu hủy
   * - canceled: Đã hủy
   */
  async countAll(
    from?: Date,
    to?: Date
  ): Promise<{
    total: number;
    pending: number;
    toShip: number;
    shipping: number;
    complete: number;
    inComplete: number;
    cancelRequest: number;
    canceled: number;
  }> {
    return this.DonHangRepo.countAll(from, to);
  }

  /**
   * Xác định đơn vị thời gian phù hợp (day, month, year) dựa trên khoảng thời gian.
   *
   * - Nếu chênh lệch lớn hơn 12 tháng → trả về `'year'`
   * - Nếu chênh lệch lớn hơn 2 tháng → trả về `'month'`
   * - Ngược lại → trả về `'day'`
   *
   * @param from - Ngày bắt đầu của khoảng thời gian
   * @param to - Ngày kết thúc của khoảng thời gian
   * @returns Đơn vị thời gian tương ứng: `'day'` | `'month'` | `'year'`
   */
  getTimeUnitByRange(from: Date, to: Date): 'day' | 'month' | 'year' {
    const start = new Date(from);
    const end = new Date(to);
    const diffInMonths =
      end.getFullYear() * 12 +
      end.getMonth() -
      (start.getFullYear() * 12 + start.getMonth());
    if (diffInMonths >= 12) {
      return 'year';
    } else if (diffInMonths >= 2) {
      return 'month';
    } else {
      return 'day';
    }
  }

  /**
   * Truy vấn và tổng hợp thống kê đơn hàng trong khoảng thời gian được chỉ định.
   *
   * Bao gồm các thông tin:
   * - Số lượng đơn hàng theo trạng thái và theo mốc thời gian (ngày/tháng/năm)
   * - Danh sách ID đơn hàng hoàn tất và thất bại để phân tích giảm giá
   * - Thống kê khuyến mãi, voucher được sử dụng
   * - Phân loại người mua (thành viên / khách vãng lai)
   * - Thống kê đơn hàng theo tỉnh thành
   *
   * @param from - Ngày bắt đầu thống kê (định dạng `Date`)
   * @param to - Ngày kết thúc thống kê (định dạng `Date`)
   * @returns Thống kê tổng hợp theo kiểu `StatsResult`
   * @throws {InternalServerErrorException} Nếu xảy ra lỗi trong quá trình xử lý.
   */
  public async getStatsByDateRange(from: Date, to: Date): Promise<StatsResult> {
    const groupBy = this.getTimeUnitByRange(from, to);
    const orderStats = await this.DonHangRepo.getOrderStatsByStatus(
      from,
      to,
      groupBy
    );
    const {
      detail: ordersDetail,
      completeOrderIds,
      inCompleteOrderIds,
    } = await this.processOrderStats(orderStats);
    const totalDiscountStats = await this.calculateDiscountStats(
      completeOrderIds,
      inCompleteOrderIds
    );
    const vouchers = await this.getVoucherStats([
      ...completeOrderIds,
      ...inCompleteOrderIds,
    ]);
    const buyerStats = await this.DonHangRepo.getOrderStatsByCustomerType(
      from,
      to
    );
    const orderIds = await this.DonHangRepo.getOrderIdsByDate(from, to);
    const provincesStats =
      await this.NhanHangDHService.getStatsByProvince(orderIds);
    const result = await Promise.all(
      provincesStats.map(async (item) => {
        const province =
          item.provinceId !== undefined
            ? await this.DiaChiService.getProvinceInfo(item.provinceId)
            : undefined;
        return {
          ...item,
          provinceName: province?.T_ten ? province?.T_ten : 'Không xác định',
        };
      })
    );
    const reviewStats = await this.DanhGiaServiceUtil.getRatingStats(orderIds);
    return {
      orders: ordersDetail,
      vouchers,
      buyers: {
        member: buyerStats.member ?? 0,
        guest: buyerStats.guest ?? 0,
      },
      totalDiscountStats,
      provinces: result,
      reviews: reviewStats,
    };
  }

  /**
   * Xử lý thống kê đơn hàng theo từng mốc thời gian (ngày/tháng/năm),
   * phân loại đơn hoàn tất và chưa hoàn tất, đồng thời tổng hợp các thống kê chi tiết cho từng nhóm.
   *
   * @param orderStats - Dữ liệu đơn hàng theo trạng thái được nhóm theo ngày/tháng/năm.
   * @returns Một object chứa:
   * - `detail`: Thống kê chi tiết theo từng ngày gồm tổng số đơn, đơn hoàn tất, đơn chưa hoàn tất, đơn huỷ.
   * - `completeOrderIds`: Tập hợp các `orderId` của đơn hoàn tất.
   * - `inCompleteOrderIds`: Tập hợp các `orderId` của đơn chưa hoàn tất.
   * @throws {InternalServerErrorException} Nếu xảy ra lỗi trong quá trình truy vấn chi tiết đơn hàng.
   */
  private async processOrderStats(orderStats: Record<string, any>): Promise<{
    detail: Record<string, OrderStatsByDate>;
    completeOrderIds: string[];
    inCompleteOrderIds: string[];
  }> {
    const detail: Record<string, OrderStatsByDate> = {};
    const completeOrderIds: string[] = [];
    const inCompleteOrderIds: string[] = [];
    for (const [date, stats] of Object.entries(orderStats)) {
      const complete = stats.complete ?? { orderIds: [], stats: {} };
      const inComplete = stats.inComplete ?? {
        orderIds: [],
        stats: {},
      };
      const total = stats.total ?? {
        all: 0,
        complete: 0,
        inComplete: 0,
        canceled: 0,
      };
      const completeIds = complete.orderIds ?? [];
      const inCompleteIds = inComplete.orderIds ?? [];
      completeOrderIds.push(...completeIds);
      inCompleteOrderIds.push(...inCompleteIds);
      const completeStats = completeIds.length
        ? await this.ChiTietDonHangRepo.getOrderDetailsStats(completeIds)
        : this.emptyStats();
      const inCompleteStats = inCompleteIds.length
        ? await this.ChiTietDonHangRepo.getOrderDetailsStats(inCompleteIds)
        : this.emptyStats();
      detail[date] = {
        total: {
          all: total.all ?? 0,
          complete: total.complete ?? 0,
          inComplete: total.inComplete ?? 0,
          canceled: total.canceled ?? 0,
        },
        complete: {
          ...completeStats,
          totalBillSale: complete.stats?.totalBillSale ?? 0,
          totalShipSale: complete.stats?.totalShipSale ?? 0,
          totalShipPrice: complete.stats?.totalShipPrice ?? 0,
        },
        inComplete: {
          ...inCompleteStats,
          totalBillSale: inComplete.stats?.totalBillSale ?? 0,
          totalShipSale: inComplete.stats?.totalShipSale ?? 0,
          totalShipPrice: inComplete.stats?.totalShipPrice ?? 0,
        },
      };
    }
    return {
      detail,
      completeOrderIds,
      inCompleteOrderIds,
    };
  }

  /**
   * Tính thống kê số lượng sản phẩm có áp dụng giảm giá trong các đơn hàng hoàn tất và chưa hoàn tất.
   *
   * @param completeOrderIds - Danh sách ID các đơn hàng đã hoàn tất.
   * @param inCompleteOrderIds - Danh sách ID các đơn hàng chưa hoàn tất.
   * @returns Thống kê tổng sản phẩm và số sản phẩm đã giảm giá trong toàn bộ đơn hàng.
   * Dạng trả về:
   * -  `totalProducts`: Tổng số sản phẩm
   * - `discountedProducts`: Số sản phẩm đã áp dụng khuyến mãi
   * @throws {InternalServerErrorException} Nếu xảy ra lỗi trong khi truy vấn thống kê.
   */
  private async calculateDiscountStats(
    completeOrderIds: string[],
    inCompleteOrderIds: string[]
  ): Promise<DiscountedProductStats> {
    const completeStats = completeOrderIds.length
      ? await this.ChiTietDonHangRepo.getDiscountedProductStats(
          completeOrderIds
        )
      : { totalProducts: 0, discountedProducts: 0 };
    const inCompleteStats = inCompleteOrderIds.length
      ? await this.ChiTietDonHangRepo.getDiscountedProductStats(
          inCompleteOrderIds
        )
      : { totalProducts: 0, discountedProducts: 0 };
    return {
      totalProducts:
        completeStats.totalProducts + inCompleteStats.totalProducts,
      discountedProducts:
        completeStats.discountedProducts + inCompleteStats.discountedProducts,
    };
  }

  /**
   * Lấy thống kê về mã giảm giá được sử dụng trong các đơn hàng.
   *
   * @param orderIds - Danh sách ID của các đơn hàng cần thống kê.
   * @returns Thống kê mã giảm giá được sử dụng, bao gồm:
   * - `orderUsed`: Tổng số đơn có sử dụng mã giảm giá.
   * - `typeStats`: Số lượng mã theo loại (vận chuyển và đơn hàng).
   * @throws {InternalServerErrorException} Nếu xảy ra lỗi khi truy vấn `MaGiamService`.
   */
  private async getVoucherStats(orderIds: string[]): Promise<VoucherStats> {
    if (!orderIds.length) {
      return {
        orderUsed: 0,
        typeStats: { shipping: 0, order: 0 },
      };
    }
    const stats = await this.MaGiamService.getVoucherStatsForOrders(orderIds);
    return {
      orderUsed: stats.orderUsed ?? 0,
      typeStats: {
        shipping: stats.typeStats?.shipping ?? 0,
        order: stats.typeStats?.order ?? 0,
      },
    };
  }

  /**
   * Trả về một đối tượng thống kê chi tiết đơn hàng với tất cả giá trị bằng 0.
   *
   * @returns Đối tượng `OrderDetailStats` với tất cả trường được gán giá trị 0.
   */
  private emptyStats(): OrderDetailStats {
    return {
      totalSalePrice: 0,
      totalCostPrice: 0,
      totalBuyPrice: 0,
      totalQuantity: 0,
      totalBillSale: 0,
      totalShipSale: 0,
      totalShipPrice: 0,
    };
  }

  /**
   * Chuyển đổi một đối tượng `Date` thành chuỗi định dạng `yyyy-mm-dd`,
   *
   * @param date - Đối tượng `Date` cần định dạng.
   * @returns Chuỗi ngày dạng `yyyy-mm-dd`. Ví dụ: `2025-07-30`.
   */
  private formatDateForFile(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  /**
   * Tạo báo cáo thống kê đơn hàng theo khoảng thời gian và xuất thành tệp Excel.
   *
   * @param from - Ngày bắt đầu của khoảng thống kê.
   * @param to - Ngày kết thúc của khoảng thống kê.
   * @param staffId - Mã định danh nhân viên thực hiện xuất báo cáo.
   * @returns Đối tượng chứa:
   * - `buffer`: Dữ liệu nhị phân của file Excel (dạng `Buffer`) để phục vụ tải xuống hoặc gửi qua mạng.
   * - `fileName`: Tên file được đề xuất cho tệp Excel xuất ra, định dạng `Thong-ke-yyyy-mm-dd-yyyy-mm-dd.xlsx`.
   */
  async getExcelReportStatsByDateRange(from: Date, to: Date, staffId: string) {
    const stats = await this.getStatsByDateRange(from, to);
    const staffInfor = await this.NhanVienService.findById(staffId);
    const fileName = `${this.formatDateForFile(from)}-${this.formatDateForFile(to)}`;
    const sheets = this.getExcelReportStats(stats, {
      NV_hoTen: staffInfor.NV_hoTen,
      NV_email: staffInfor.NV_email,
      NV_tenVaiTro: staffInfor.NV_tenVaiTro,
      NV_soDienThoai: staffInfor.NV_soDienThoai,
    });
    const buffer = await this.ExportService.generateExcelBuffer_ordersStats(
      sheets,
      {
        staff: {
          NV_id: staffInfor.NV_id,
          NV_hoTen: staffInfor.NV_hoTen,
          NV_email: staffInfor.NV_email,
          NV_soDienThoai: staffInfor.NV_soDienThoai,
          NV_tenVaiTro: staffInfor.NV_tenVaiTro,
        },
        dateRange: { start: from, end: to },
      }
    );
    const exportFileName = 'Thong-ke-' + fileName + '.xlsx';
    return { buffer, fileName: exportFileName };
  }

  /**
   * Tạo dữ liệu báo cáo thống kê định dạng bảng (sheet) dùng để xuất ra Excel.
   *
   * @param data - Kết quả thống kê theo từng ngày (bao gồm đơn hoàn tất, chưa hoàn tất, tổng).
   * @param staff - Thông tin nhân viên xuất báo cáo:
   *   - `NV_hoTen`: Họ tên nhân viên.
   *   - `NV_email`: Email liên hệ.
   *   - `NV_soDienThoai`: Số điện thoại.
   *   - `NV_tenVaiTro`: Tên vai trò hoặc chức vụ.
   * @returns Mảng `SheetData` gồm 1 sheet có tên 'Báo cáo thống kê', chứa:
   * - Bảng thông tin nhân viên xuất báo cáo.
   * - Bảng thống kê đơn hàng theo ngày.
   */
  protected getExcelReportStats(
    data: StatsResult,
    staff: {
      NV_hoTen: string;
      NV_email: string;
      NV_soDienThoai: string;
      NV_tenVaiTro: string;
    }
  ): SheetData[] {
    return [
      {
        sheetName: 'Báo cáo thống kê',
        headers: [],
        rows: [
          // 1. Thông tin người xuất
          ['Họ tên', 'Email', 'Vai trò', 'Số điện thoại'],
          [
            staff.NV_hoTen,
            staff.NV_email,
            staff.NV_tenVaiTro,
            staff.NV_soDienThoai,
          ],
          // 3. Đơn hàng
          [
            'Thời gian',
            'Tổng đơn',
            'Giao thành công',
            'Giao thất bại',
            'Doanh thu (sản phẩm)',
            'Doanh thu thuần (sản phẩm)',
            'Doanh thu (vận chuyển)',
            'Doanh thu thuần (vận chuyển)',
          ],
          ...Object.entries(data.orders).map(
            ([date, stats]: [string, any]): [
              string,
              number,
              number,
              number,
              number,
              number,
              number,
              number,
            ] => {
              const revenueP =
                stats.complete.totalSalePrice + stats.inComplete.totalSalePrice;
              const netRevenueP =
                stats.complete.totalBuyPrice - stats.complete.totalBillSale;
              const revenueS =
                stats.complete.totalShipPrice + stats.inComplete.totalShipPrice;
              const netRevenueS =
                stats.complete.totalShipPrice - stats.complete.totalShipSale;
              return [
                date,
                Number(
                  (stats.total.complete ?? 0) + (stats.total.inComplete ?? 0)
                ),
                Number(stats.total.complete ?? 0),
                Number(stats.total.inComplete ?? 0),
                Number(revenueP ?? 0),
                Number(netRevenueP ?? 0),
                Number(revenueS ?? 0),
                Number(netRevenueS ?? 0),
              ];
            }
          ),
        ],
      },
    ];
  }
}
