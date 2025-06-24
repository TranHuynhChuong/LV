import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';
import { MaGiamUtilService } from 'src/MaGiam/maGiam.service';
import { NhanVienUtilService } from 'src/NguoiDung/NhanVien/nhanVien.service';
import { SanPhamUtilService } from 'src/SanPham/sanPham.service';
import { TTNhanHangDHService } from './../TTNhanHang/ttNhanHang.service';
import { ConfigService } from '@nestjs/config';
import { CheckDto, CreateDto } from './donHang.dto';
import {
  DonHangRepository,
  OrderFilterType,
} from './repositories/donHang.repository';
import { EmailService } from 'src/Util/email.service';
import { KhachHangUtilService } from 'src/NguoiDung/KhachHang/khachHang.service';
import { OrderStatus } from './schemas/donHang.schema';
import { ChiTietDonHangRepository } from './repositories/chiTietDonHang.repository';
import { MaGiamDonHangRepository } from './repositories/maGiamDonHang.repository';

@Injectable()
export class DonHangService {
  constructor(
    private readonly configService: ConfigService,
    private readonly EmailService: EmailService,
    private readonly KhachHang: KhachHangUtilService,
    @InjectConnection() private readonly connection: Connection,

    private readonly SanPham: SanPhamUtilService,
    private readonly NhanVien: NhanVienUtilService,
    private readonly MaGiam: MaGiamUtilService,
    private readonly NhanHang: TTNhanHangDHService,

    private readonly DonHang: DonHangRepository,
    private readonly ChiTietDonHang: ChiTietDonHangRepository,
    private readonly MaGiamDonHang: MaGiamDonHangRepository
  ) {}

  async checkValid(data: CheckDto): Promise<{
    errors: number[];
    products: any[];
    vouchers: any[];
  }> {
    const ctSanPham = data.CTDH;
    const spIds = ctSanPham.map((item) => item.SP_id);
    const magiamIds = data.MG?.map((item) => item.MG_id) || [];

    const sanPhams = await this.SanPham.findByIds(spIds);
    const maGiams = await this.MaGiam.findValidByIds(magiamIds);

    const spMap = new Map(sanPhams.map((sp) => [sp.SP_id, sp]));
    const errorCodes = new Set<number>();

    for (const item of ctSanPham) {
      const sp = spMap.get(item.SP_id);

      if (!sp) {
        errorCodes.add(1001); // SP không tồn tại hoặc ẩn
        continue;
      }

      if (item.CTDH_soLuong > sp.SP_tonKho) {
        errorCodes.add(1002); // Không đủ tồn kho
      }

      const giaBanThayDoi = item.CTDH_giaBan !== sp.SP_giaBan;
      const giaMuaThayDoi =
        item.CTDH_giaMua !== (sp.SP_giaGiam ?? sp.SP_giaBan); // nếu có giảm giá

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
      products: sanPhams, // Trả về danh sách sản phẩm đã fetch
      vouchers: maGiams,
    };
  }

  private async generateNextDHId(session: ClientSession): Promise<string> {
    const lastId = await this.DonHang.findLastId(session);

    // Nếu chưa có đơn hàng nào → bắt đầu từ đầu
    if (!lastId) return 'AAA000000001';

    const prefix = lastId.slice(0, 3); // 'AAA'
    const numberPart = lastId.slice(3); // '000000001'

    const nextNumber = parseInt(numberPart, 10) + 1;

    if (nextNumber > 999999999) {
      // Nếu vượt quá 9 chữ số thì tăng prefix
      const nextPrefix = this.incrementPrefix(prefix);
      if (!nextPrefix) throw new Error('Đã vượt quá giới hạn mã đơn hàng');
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
      throw new ConflictException();
    }
    if (KH_id && KH_email) {
      throw new ConflictException();
    }
  }

  private calculateTotalAmount(data: CreateDto): number {
    return data.DH.CTDH.reduce(
      (sum, item) => sum + item.CTDH_giaMua * item.CTDH_soLuong,
      0
    );
  }

  private async calculateDiscount(data: CreateDto, tongTienSP: number) {
    const validMGs = await this.MaGiam.findValidByIds(
      data.MG?.map((m) => m.MG_id) || []
    );

    let DH_giamHD = 0;
    let DH_giamVC = 0;

    for (const mg of validMGs) {
      if (mg.MG_loai === 1) {
        if (tongTienSP >= (mg.MG_toiThieu || 0)) {
          const giam = mg.MG_theoTyLe
            ? (tongTienSP * mg.MG_giaTri) / 100
            : mg.MG_giaTri;
          DH_giamHD += mg.MG_toiDa ? Math.min(giam, mg.MG_toiDa) : giam;
        }
      } else if (mg.MG_loai === 2) {
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
    return await this.DonHang.create(
      {
        DH_id: context.DH_id,
        DH_ngayTao: context.now,
        DH_giamHD: context.DH_giamHD,
        DH_giamVC: context.DH_giamVC,
        DH_phiVC: data.DH.DH_phiVC,
        DH_trangThai: OrderStatus.Pendding,
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
        await this.NhanHang.create({ DH_id, ...data.NH }, session);

        // B7. Tạo chi tiết đơn hàng
        await this.ChiTietDonHang.create(DH_id, data.DH.CTDH, session);

        // B8. Tạo mã giảm đơn hàng nếu có
        const magiamIds = data.MG?.map((m) => m.MG_id) ?? [];
        if (magiamIds.length > 0) {
          await this.MaGiamDonHang.create(DH_id, magiamIds, session);
        }

        // B9.  Cập nhật đã bán và tồn kho
        const updates = data.DH.CTDH.map((item) => ({
          id: item.SP_id.toString(),
          sold: item.CTDH_soLuong,
        }));
        await this.SanPham.updateSold(updates, session);

        // B10. Gửi email thông báo đơn hàng đã tạo thành công
        let email = data.DH.KH_email;
        if (!email && data.DH.KH_id) {
          email = await this.KhachHang.getEmail(data.DH.KH_id);
        }
        if (!email) throw new BadRequestException();
        this.EmailService.sendOrderCreatetion(email, DH_id);

        return newOrder;
      });

      return result;
    } catch (error) {
      if (error instanceof Error) throw error;
      console.error(error);
      throw new InternalServerErrorException();
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
      [OrderStatus.Canceled]: 'Yêu cầu hủy được xác nhận',
    };
    const thaoTac = statusActionMap[newStatus];

    if (!thaoTac) return null;

    const order = await this.DonHang.getById(id);
    if (!order) throw new NotFoundException();

    let email = order.KH_email;
    if (!email && order.KH_id) {
      email = await this.KhachHang.getEmail(order.KH_id);
    }
    if (!email) throw new BadRequestException();

    this.notifyEmailStatus(newStatus, email, order.DH_id);

    return this.DonHang.update(id, newStatus, {
      thaoTac,
      NV_id: staffId,
      thoiGian: new Date(),
    });
  }

  async findById(id: string, filterType?: OrderFilterType): Promise<any> {
    const result: any = await this.DonHang.findById(id, filterType);
    if (!result) {
      throw new NotFoundException();
    }

    const lichSu = result.lichSuThaoTac ?? [];
    result.lichSuThaoTac =
      lichSu.length > 0 ? await this.NhanVien.mapActivityLog(lichSu) : [];

    if ((!result.KH_email || result.KH_email === '') && result.KH_id) {
      result.KH_email = await this.KhachHang.getEmail(result.KH_id);
    }
    return result;
  }

  async findAll(
    page: number,
    limit: number = 24,
    filterType?: OrderFilterType,
    userId?: number
  ) {
    const result = await this.DonHang.findAll(page, limit, filterType, userId);

    return result;
  }

  async countAll(): Promise<{
    total: number;
    pending: number;
    toship: number;
    shipping: number;
    complete: number;
    cancelrequest: number;
  }> {
    return this.DonHang.countAll();
  }
}
