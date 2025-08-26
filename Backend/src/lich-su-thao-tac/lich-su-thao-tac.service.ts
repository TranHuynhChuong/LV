import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { LichSuThaoTacRepository } from './repositories/lich-su-thao-tac.repository';
import { LichSuThaoTac, DULIEU } from './schemas/lich-su-thao-tac.schema';
import { ClientSession } from 'mongoose';
import { NhanVienUtilService } from 'src/nguoi-dung/nhan-vien/nhan-vien.service';

interface ActivityLogUser {
  id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  roleName: string | null;
}

export interface ActivityLog {
  time: Date;
  action: string;
  user: ActivityLogUser;
}

const typeOfChange_account: Record<string, string> = {
  NV_hoTen: 'Họ tên',
  NV_email: 'Email',
  NV_soDienThoai: 'Số điện thoại',
  NV_vaiTro: 'Vai trò',
  NV_matKhau: 'Mật khẩu',
  NV_daKhoa: 'Trạng thái khóa tài khoản',
};

const typeOfChange_book: Record<string, string> = {
  TL_id: 'Thể loại',
  S_trangThai: 'Trạng thái',
  S_ten: 'Tên',
  S_tomTat: 'Nội dung tóm tắt',
  S_moTa: 'Mô tả',
  S_tacGia: 'Tác giả',
  S_nhaXuaBan: 'Nhà xuất bản',
  S_ngonNgu: 'Ngôn ngữ',
  S_nguoiDich: 'Người dịch',
  S_namXuatBan: 'Năm xuất bản',
  S_soTrang: 'Số trang',
  S_isbn: 'ISBN',
  S_giaBan: 'Giá bán',
  S_giaNhap: 'Giá nhập',
  S_tonKho: 'Tồn kho',
  S_trongLuong: 'Trọng lượng',
  S_kichThuoc: 'Kích thước',
  S_anh: 'Hình ảnh',
};

const typeOfChange_shppingFee: Record<string, string> = {
  PVC_phi: 'Phí',
  PVC_ntl: 'Ngưỡng khối lượng',
  PVC_phuPhi: 'Phụ phí',
  PVC_dvpp: 'Đơ vị phụ phí',
  T_id: 'Khu vực',
};

const typeOfChange_category: Record<string, string> = {
  TL_ten: 'Tên thể loại',
  TL_idTL: 'Thể loại cha',
};

const typeOfChange_voucher: Record<string, string> = {
  MG_batDau: 'Thời gian bắt đầu',
  MG_ketThuc: 'Thời gian kết thúc',
  MG_theoTyLe: 'Kiểu giảm giá',
  MG_giaTri: 'Giá trị giảm',
  MG_loai: 'Loại mã giảm',
  MG_toiThieu: 'Giá trị tối thiểu',
  MG_toiDa: 'Giá trị tối đa',
};

const typeOfChange_promotion: Record<string, string> = {
  KM_ten: 'Tên',
  KM_batDau: 'Thời gian bắt đầu',
  KM_ketThuc: 'Thời gian kết thúc',
  KM_chiTiet: 'Sản phẩm khuyến mãi',
};

enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

@Injectable()
export class LichSuThaoTacService {
  constructor(
    @Inject(forwardRef(() => NhanVienUtilService))
    private readonly NhanVienService: NhanVienUtilService,
    private readonly LichSuThaoTacRepository: LichSuThaoTacRepository
  ) {}

  /**
   * Ghi lại một thao tác vào lịch sử thao tác.
   * @param params Tham số đầu vào dạng object, bao gồm:
   *  - actionType: Tên thao tác (VD: "Tạo", "Cập nhật", "Xóa")
   *  - staffId: ID nhân viên thực hiện thao tác
   *  - dataName: Tên dữ liệu thao tác (enum DULIEU)
   *  - dataId: ID của dữ liệu được thao tác
   *  - newData: Dữ liệu mới (nếu có)
   *  - existingData: Dữ liệu cũ (nếu có)
   *  - ignoreFields: Mảng các field cần bỏ qua khi so sánh
   *  - session: ClientSession để quản lý transaction MongoDB (nếu có)
   * @returns Bản ghi lịch sử thao tác vừa được tạo, gồm:
   *  - action: Mô tả thao tác
   *  - fieldsChange: Danh sách field bị thay đổi
   *  - updatePayload: Dữ liệu thay đổi
   */
  async create(params: {
    actionType: string;
    staffId: string;
    dataName: DULIEU;
    dataId: string | number;
    newData?: any;
    existingData?: any;
    ignoreFields?: string[];
    session?: ClientSession;
  }): Promise<{ action: string; fieldsChange: string[]; updatePayload: any }> {
    const {
      actionType,
      staffId,
      dataName,
      dataId,
      newData,
      existingData,
      ignoreFields = [],
      session,
    } = params;

    const typeOfChange: Record<string, string> = this.getTypeOfChange(dataName);
    const action = this.detectChanges(
      actionType,
      ignoreFields,
      typeOfChange,
      newData,
      existingData
    );
    const result = await this.LichSuThaoTacRepository.create(
      {
        thaoTac: action.action,
        NV_id: staffId,
        duLieu: dataName,
        idDuLieu: dataId,
      } as LichSuThaoTac,
      session
    );
    if (!result) throw new BadRequestException();
    return action;
  }

  /**
   * Lấy mapping key -> nhãn hiển thị cho từng loại dữ liệu
   * @param dataName Loại dữ liệu (enum DULIEU)
   * @returns Record mapping key -> label
   */
  private getTypeOfChange(dataName: DULIEU): Record<string, string> {
    switch (dataName) {
      case DULIEU.BOOK:
        return typeOfChange_book;
      case DULIEU.VOUCHER:
        return typeOfChange_voucher;
      case DULIEU.PROMOTION:
        return typeOfChange_promotion;
      case DULIEU.ACCOUNT:
        return typeOfChange_account;
      case DULIEU.SHIPPINGFEE:
        return typeOfChange_shppingFee;
      case DULIEU.CATEGORY:
        return typeOfChange_category;
      default:
        return {};
    }
  }

  /**
   * So sánh dữ liệu mới và dữ liệu cũ, xác định các field thay đổi
   * @param actionType Loại hành động (CREATE, UPDATE, DELETE hoặc tên khác)
   * @param ignoreFields Danh sách field bỏ qua khi so sánh
   * @param typeOfChange Mapping key -> nhãn hiển thị
   * @param newData Dữ liệu mới
   * @param existingData Dữ liệu cũ
   * @returns object gồm action, fieldsChange, updatePayload
   */
  private detectChanges(
    actionType: ActionType | string,
    ignoreFields: string[] = [],
    typeOfChange: Record<string, string> = {},
    newData: Record<string, any> = {},
    existingData: Record<string, any> = {}
  ) {
    const fieldsChange: string[] = [];
    const updatePayload: Record<string, any> = {};

    let action: string;
    switch (String(actionType)) {
      case String(ActionType.UPDATE):
        for (const key of Object.keys(newData)) {
          if (ignoreFields.includes(key)) continue;
          const newValue = newData[key];
          const oldValue = existingData[key];
          if (newValue === undefined) continue;

          if (this.hasChanged(newValue, oldValue)) {
            if (typeOfChange[key]) {
              fieldsChange.push(typeOfChange[key]);
              updatePayload[key] = newValue;
            }
          }
        }
        action =
          fieldsChange.length > 0
            ? `Cập nhật dữ liệu: ${fieldsChange.join(', ')}`
            : actionType;
        break;
      case String(ActionType.CREATE):
        action = 'Thêm mới dữ liệu';
        break;
      case String(ActionType.DELETE):
        action = 'Xóa dữ liệu';
        break;
      default:
        action = actionType.charAt(0).toUpperCase() + actionType.slice(1);
    }
    return { action, fieldsChange, updatePayload };
  }

  /**
   * Kiểm tra 2 giá trị bất kỳ có khác nhau hay không
   * - Hỗ trợ primitive, object và array
   */
  private hasChanged(a: any, b: any): boolean {
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() !== b.getTime();
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      return (
        a.length !== b.length || a.some((v, i) => this.hasChanged(v, b[i]))
      );
    }
    if (this.isObject(a) && this.isObject(b)) {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return true;
      return keysA.some((k) => this.hasChanged(a[k], b[k]));
    }
    return a !== b;
  }

  /**
   * Kiểm tra giá trị có phải object (không phải array, không null)
   */
  private isObject(value: any) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Tìm bản ghi lịch sử thao tác dựa vào id dữ liệu và loại dữ liệu
   * @param id ID dữ liệu
   * @param dataName Loại dữ liệu (enum DULIEU)
   * @returns Bản ghi lịch sử thao tác hoặc null nếu không tìm thấy
   */
  async findByReference(
    id: string,
    dataName: string,
    skip?: number,
    limit?: number
  ): Promise<any> {
    const results = await this.LichSuThaoTacRepository.findByReference(
      id,
      dataName,
      skip,
      limit
    );
    if (!results || results.length === 0) return [];
    const ids = [
      ...new Set(results.map((a) => a.NV_id).filter(Boolean)),
    ] as string[];
    const users = await this.NhanVienService.findAllIds(ids);
    const resultsMap = new Map<string, any>();
    users.forEach((r) => resultsMap.set(r.NV_id, r));
    return results.map((a) => {
      const r = a.NV_id ? resultsMap.get(a.NV_id) : undefined;
      return {
        time: a.thoiGian,
        action: a.thaoTac,
        user: {
          id: r?.NV_id ?? null,
          name: r?.NV_hoTen ?? null,
          email: r?.NV_email ?? null,
          phone: r?.NV_soDienThoai ?? null,
          roleName: r?.NV_tenVaiTro ?? null,
        },
      };
    });
  }
}
