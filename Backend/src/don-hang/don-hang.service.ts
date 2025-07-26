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
    private readonly DiaChiService: DiaChiService,

    private readonly DonHangRepo: DonHangRepository,
    private readonly ChiTietDonHangRepo: ChiTietDonHangRepository
  ) {}

  async checkValid(data: CheckDto): Promise<{
    errors: number[];
    products: any[];
    vouchers: any[];
  }> {
    const ctSach = data.CTDH;
    const spIds = ctSach.map((item) => item.S_id);
    const magiamIds = data.MG?.map((item) => item.MG_id) || [];

    const Sachs = await this.SachService.findByIds(spIds);
    const maGiams = await this.MaGiamService.findValidByIds(magiamIds);

    const spMap = new Map(Sachs.map((sp) => [sp.S_id, sp]));
    const errorCodes = new Set<number>();

    for (const item of ctSach) {
      const sp = spMap.get(item.S_id);

      if (!sp) {
        errorCodes.add(1001); // SP không tồn tại hoặc ẩn
        continue;
      }

      if (item.CTDH_soLuong > sp.S_tonKho) {
        errorCodes.add(1002); // Không đủ tồn kho
      }

      const giaBanThayDoi = item.CTDH_giaBan !== sp.S_giaBan;
      const giaMuaThayDoi = item.CTDH_giaMua !== (sp.S_giaGiam ?? sp.S_giaBan); // nếu có giảm giá

      if (giaBanThayDoi || giaMuaThayDoi) {
        errorCodes.add(1003); // Giá thay đổi
      }
    }

    const validMGSet = new Set(maGiams.map((m) => m.MG_id));
    const invalidMG = magiamIds.filter((id) => !validMGSet.has(id));

    if (invalidMG.length > 0) {
      errorCodes.add(2001); // Mã giảm không hợp lệ
    }

    return {
      errors: [...errorCodes],
      products: Sachs, // Trả về danh sách sản phẩm đã fetch
      vouchers: maGiams,
    };
  }

  private async generateNextDHId(session: ClientSession): Promise<string> {
    const lastId = await this.DonHangRepo.findLastId(session);

    // Nếu chưa có đơn hàng nào → bắt đầu từ đầu
    if (!lastId) return 'AAA000000001';

    const prefix = lastId.slice(0, 3); // 'AAA'
    const numberPart = lastId.slice(3); // '000000001'

    const nextNumber = parseInt(numberPart, 10) + 1;

    if (nextNumber > 999999999) {
      // Nếu vượt quá 9 chữ số thì tăng prefix
      const nextPrefix = this.incrementPrefix(prefix);
      if (!nextPrefix)
        throw new Error('Tạo đơn hành - Đã vượt quá giới hạn mã đơn hàng');
      return `${nextPrefix}000000001`;
    }

    return `${prefix}${nextNumber.toString().padStart(9, '0')}`;
  }

  private incrementPrefix(prefix: string): string | null {
    const chars = prefix.split('');
    for (let i = 2; i >= 0; i--) {
      if (chars[i] === 'Z') {
        chars[i] = 'A';
      } else {
        chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
        return chars.join('');
      }
    }
    return null; // nếu đến ZZZ thì không tăng được nữa
  }

  private validateCustomerInf(KH_email?: string, KH_id?: number) {
    if (!KH_id && !KH_email) {
      throw new ConflictException(
        'Tạo đơn hàng - Đơn hàng không có chủ sở hữu'
      );
    }
    if (KH_id && KH_email) {
      throw new ConflictException(
        'Tạo đơn hàng - Đơn hàng có nhiều chủ sở hữu'
      );
    }
  }

  private calculateTotalAmount(data: CreateDto): number {
    return data.DH.CTDH.reduce(
      (sum, item) => sum + item.CTDH_giaMua * item.CTDH_soLuong,
      0
    );
  }

  private async calculateDiscount(data: CreateDto, tongTienSP: number) {
    const validMGs = await this.MaGiamService.findValidByIds(
      data.MG?.map((m) => m.MG_id) || []
    );

    let DH_giamHD = 0;
    let DH_giamVC = 0;

    for (const mg of validMGs) {
      if (mg.MG_loai === 'hd') {
        if (tongTienSP >= (mg.MG_toiThieu || 0)) {
          const giam = mg.MG_theoTyLe
            ? (tongTienSP * mg.MG_giaTri) / 100
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

  async create(data: CreateDto) {
    const session = await this.connection.startSession();
    try {
      const result = await session.withTransaction(async () => {
        // B1: Kiểm tra dữ liệu đầu vào
        const { errors } = await this.checkValid({
          CTDH: data.DH.CTDH,
          MG: data.MG,
        });
        if (errors.length > 0) {
          throw new ConflictException(errors);
        }

        // B2 Tạo mã đơn hàng
        const DH_id = await this.generateNextDHId(session);
        const now = new Date();

        // B3 Tính tổng tiền sản phẩm - để tính giá giảm nếu có dùng mã giảm
        const tongTienSP = this.calculateTotalAmount(data);

        // B4 Tính giá giảm khi dùng mã giảm
        const { DH_giamHD, DH_giamVC } = await this.calculateDiscount(
          data,
          tongTienSP
        );

        // B5 Check KH_id/KH_email và tạo đơn hàng;
        this.validateCustomerInf(data.DH.KH_email, data.DH.KH_id);
        const newOrder = await this.createOrder(data, {
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

        return newOrder;
      });

      return result;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new InternalServerErrorException(`Tạo đơn hàng - ${error.message}`);
    } finally {
      await session.endSession();
    }
  }

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
        const order = await this.DonHangRepo.getById(id);
        if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

        let email = order.KH_email;
        if (!email && order.KH_id) {
          email = await this.KhachHangService.getEmail(order.KH_id);
        }
        if (!email) throw new NotFoundException('Khách hàng không tồn tại');

        this.notifyEmailStatus(newStatus, email, order.DH_id);

        const result = await this.DonHangRepo.update(
          id,
          newStatus,
          {
            thaoTac,
            NV_id: staffId,
            thoiGian: new Date(),
          },
          session
        );

        if (!result)
          throw new BadRequestException('Cập nhật đơn hàng thất bại');

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

  async findById(id: string, filterType?: OrderStatus): Promise<any> {
    const result: any = await this.DonHangRepo.findById(id, filterType);
    if (!result) {
      throw new NotFoundException('Tìm đơn hàng - Đơn hàng không tồn tại');
    }

    const lichSu = result.lichSuThaoTac ?? [];
    result.lichSuThaoTac =
      lichSu.length > 0
        ? await this.NhanVienService.mapActivityLog(lichSu)
        : [];

    if ((!result.KH_email || result.KH_email === '') && result.KH_id) {
      result.KH_email = await this.KhachHangService.getEmail(result.KH_id);
    }
    result.thongTinNhanHang = await this.NhanHangDHService.findByDHId(
      result.DH_id
    );
    return result;
  }

  async searchOrder(id: string): Promise<any> {
    const order = await this.DonHangRepo.findById(id);
    if (!order) return null;
    delete order.lichSuThaoTac;
    delete order.DH_HD;

    order.thongTinNhanHang = await this.NhanHangDHService.findByDHId(
      order.DH_id
    );
    return order;
  }

  async findAll(options: {
    page: number;
    limit: number;
    filterType?: OrderStatus;
    from?: Date;
    to?: Date;
    userId?: number;
  }) {
    const { page, limit = 12, filterType, from, to, userId } = options;
    // Nếu không có dateStart và dateEnd thì mặc định là hôm nay

    const result = await this.DonHangRepo.findAll({
      page: page,
      limit: limit,
      filterType: filterType,
      from,
      to,
      userId: userId,
    });

    for (const order of result.data as any[]) {
      delete order?.lichSuThaoTac;
      delete order?.thongTinNhanHang;
    }

    return result;
  }

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

  // ===================== Thống kê =========================//
  // Xác định kiểu thời gian thống kê
  getTimeUnitByRange(from: Date, to: Date): 'day' | 'month' | 'year' {
    const start = new Date(from);
    const end = new Date(to);

    const diffInMonths =
      end.getFullYear() * 12 +
      end.getMonth() -
      (start.getFullYear() * 12 + start.getMonth());

    if (diffInMonths > 12) {
      return 'year';
    } else if (diffInMonths > 2) {
      return 'month';
    } else {
      return 'day';
    }
  }

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
    return {
      orders: ordersDetail,
      vouchers,
      buyers: {
        member: buyerStats.member ?? 0,
        guest: buyerStats.guest ?? 0,
      },
      totalDiscountStats,
      provinces: result,
    };
  }

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

  private formatDateForFile(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

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
                Number(stats.total.all ?? 0),
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
