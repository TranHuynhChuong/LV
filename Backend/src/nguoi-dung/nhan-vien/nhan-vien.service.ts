import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NhanVienRepository } from './repositories/nhan-vien.repository';

import { NhanVien } from './schemas/nhan-vien.schema';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CreateNhanVienDto } from './dto/create-nhan-vien.dto';
import { UpdateNhanVienDto } from './dto/update-nhan-vien.dto';
import { getNextSequence } from 'src/Util/counter.service';

export interface ThaoTac {
  thoiGian: Date;
  thaoTac: string;
  nhanVien: {
    NV_id: string | null;
    NV_hoTen: string | null;
    NV_email: string | null;
    NV_soDienThoai: string | null;
  };
}

/**
 * Bản đồ ánh xạ các trường thay đổi sang nhãn hiển thị.
 */
const typeOfChange: Record<string, string> = {
  NV_hoTen: 'Họ tên',
  NV_email: 'Email',
  NV_soDienThoai: 'Số điện thoại',
  NV_vaiTro: 'Vai trò',
  NV_matKhau: 'Mật khẩu',
};

@Injectable()
export class NhanVienUtilService {
  constructor(private readonly NhanVienRepo: NhanVienRepository) {}

  /**
   * Lấy thông tin của nhiều nhân viên theo danh sách ID.
   *
   * @param ids Danh sách mã NV_id cần tìm
   * @returns Danh sách đối tượng nhân viên tương ứng
   */
  protected async findAllIds(ids: string[]): Promise<NhanVien[]> {
    return this.NhanVienRepo.findAllIds(ids);
  }

  /**
   * Bản đồ vai trò từ mã số sang tên mô tả.
   */
  vaiTroMap: Record<number, string> = {
    1: 'Quản trị',
    2: 'Quản lý',
    3: 'Bán Hàng',
  };

  /**
   * Chuyển đổi danh sách thao tác thành định dạng đầy đủ với thông tin nhân viên.
   *
   * @param activityLog Danh sách thao tác có NV_id
   * @returns Danh sách thao tác có thông tin chi tiết của nhân viên
   */
  async mapActivityLog<
    T extends { NV_id?: string; thoiGian: any; thaoTac: any },
  >(
    activityLog: T[]
  ): Promise<
    {
      thoiGian: any;
      thaoTac: any;
      nhanVien: {
        NV_id: string | null;
        NV_hoTen: string | null;
        NV_email: string | null;
        NV_soDienThoai: string | null;
      };
    }[]
  > {
    if (activityLog.length === 0) return [];
    const ids = [
      ...new Set(activityLog.map((a) => a.NV_id).filter(Boolean)),
    ] as string[];
    const nhanViens = await this.findAllIds(ids);
    const nhanVienMap = new Map<string, any>();
    nhanViens.forEach((nv) => nhanVienMap.set(nv.NV_id, nv));
    return activityLog.map((a) => {
      const nv = a.NV_id ? nhanVienMap.get(a.NV_id) : undefined;
      return {
        thoiGian: a.thoiGian,
        thaoTac: a.thaoTac,
        nhanVien: {
          NV_id: nv?.NV_id ?? null,
          NV_hoTen: nv?.NV_hoTen ?? null,
          NV_email: nv?.NV_email ?? null,
          NV_soDienThoai: nv?.NV_soDienThoai ?? null,
          NV_tenVaiTro: this.vaiTroMap[nv.NV_vaiTro] ?? null,
        },
      };
    });
  }

  /**
   * Tìm nhân viên theo ID và thêm tên vai trò vào kết quả.
   *
   * @param id Mã định danh NV_id của nhân viên
   * @returns Nhân viên kèm tên vai trò (NV_tenVaiTro)
   */
  async findById(id: string): Promise<NhanVien & { NV_tenVaiTro: string }> {
    const staff = await this.NhanVienRepo.findById(id);
    if (!staff) {
      throw new NotFoundException();
    }
    const result: NhanVien & { NV_tenVaiTro: string } = {
      ...staff,
      NV_tenVaiTro: this.vaiTroMap[staff.NV_vaiTro] ?? 'Không xác định',
    };
    return result;
  }
}

@Injectable()
export class NhanVienService {
  private readonly codeLength = 7;

  constructor(
    private readonly NhanVienRepo: NhanVienRepository,
    private readonly NhanVienUtils: NhanVienUtilService,
    @InjectConnection() private readonly connection: Connection
  ) {}

  /**
   * Tạo mới một nhân viên, sinh NV_id tự động và ghi lịch sử thao tác.
   *
   * @param newData Thông tin nhân viên mới
   * @returns Đối tượng nhân viên vừa được tạo
   * @throws BadRequestException khi tạo thất bại.
   */
  async create(newData: CreateNhanVienDto): Promise<NhanVien> {
    const session = await this.connection.startSession();
    try {
      let result: NhanVien;
      await session.withTransaction(async () => {
        if (!this.connection.db) {
          throw new Error('Không thể kết nối cơ sở dữ liệu');
        }
        // Lấy giá trị seq tự tăng từ MongoDB
        const seq = await getNextSequence(
          this.connection.db,
          'staffId',
          session
        );

        const newCode = seq.toString().padStart(this.codeLength, '0');
        const thaoTac = {
          thaoTac: 'Tạo mới',
          NV_id: newData.NV_idNV,
          thoiGian: new Date(),
        };
        const created = await this.NhanVienRepo.create(
          {
            ...newData,
            NV_id: newCode,
            lichSuThaoTac: [thaoTac],
          },
          session
        );
        if (!created)
          throw new BadRequestException(
            'Tạo nhân viên - Tạo nhân viên thất bại'
          );
        result = created;
      });
      return result!;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Lấy tất cả nhân viên chưa bị xóa mềm.
   *
   * @returns Danh sách nhân viên
   */
  async findAll(): Promise<NhanVien[]> {
    return await this.NhanVienRepo.findAll();
  }

  /**
   * Tìm chi tiết nhân viên theo ID, bao gồm lịch sử thao tác đã ánh xạ.
   *
   * @param id Mã NV_id của nhân viên
   * @returns Nhân viên và lịch sử thao tác đã xử lý
   * @throws NotFoundException khi không timg thấy.
   */
  async findById(id: string): Promise<any> {
    const result: any = await this.NhanVienRepo.findById(id);
    if (!result) {
      throw new NotFoundException('Tìm nhân viên - Không tìm thấy nhân viên');
    }
    const lichSu = result.lichSuThaoTac ?? [];
    result.lichSuThaoTac =
      lichSu.length > 0 ? await this.NhanVienUtils.mapActivityLog(lichSu) : [];
    return result;
  }

  /**
   * Cập nhật thông tin nhân viên và ghi lại các trường đã thay đổi.
   *
   * @param id Mã NV_id của nhân viên
   * @param newData Dữ liệu cập nhật
   * @returns Nhân viên sau khi cập nhật
   */
  async update(id: string, newData: UpdateNhanVienDto): Promise<NhanVien> {
    const existing = await this.NhanVienRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(
        'Cập nhật nhân viên - Không tìm thấy nhân viên'
      );
    }
    const fieldsChange: string[] = [];
    const updatePayload: any = {};
    for (const key of Object.keys(newData)) {
      if (
        newData[key] !== undefined &&
        newData[key] !== existing[key] &&
        key !== 'NV_idNV'
      ) {
        const label = typeOfChange[key] || key;
        fieldsChange.push(label);
        updatePayload[key] = newData[key]; // Chỉ thêm trường thực sự thay đổi
      }
    }
    if (fieldsChange.length > 0 && newData.NV_idNV) {
      const thaoTac = {
        thaoTac: `Cập nhật: ${fieldsChange.join(', ')}`,
        NV_id: newData.NV_idNV,
        thoiGian: new Date(),
      };

      updatePayload.lichSuThaoTac = [...existing.lichSuThaoTac, thaoTac];
    }
    // Nếu không có trường nào thay đổi thì trả về bản ghi cũ
    if (Object.keys(updatePayload).length === 0) {
      return existing;
    }
    const updated = await this.NhanVienRepo.update(id, updatePayload);
    if (!updated) {
      throw new BadRequestException(
        'Cập nhật nhân viên - Cập nhật nhân viên thất bại'
      );
    }
    return updated;
  }

  /**
   * Đánh dấu xóa mềm một nhân viên và ghi lịch sử thao tác.
   *
   * @param id Mã NV_id cần xóa
   * @param NV_id ID của người thực hiện thao tác
   * @returns Nhân viên đã được đánh dấu xóa
   */
  async delete(id: string, NV_id: string): Promise<NhanVien> {
    const existing = await this.NhanVienRepo.findById(id);
    if (!existing) throw new BadRequestException();
    const thaoTac = {
      thaoTac: 'Xóa dữ liệu',
      NV_id: NV_id,
      thoiGian: new Date(),
    };
    const lichSuThaoTac = [...existing.lichSuThaoTac, thaoTac];
    const deleted = await this.NhanVienRepo.update(id, {
      NV_daXoa: true,
      lichSuThaoTac: lichSuThaoTac,
    });
    if (!deleted) {
      throw new NotFoundException('Xóa nhân viên - Xóa nhân viên thất bại');
    }
    return deleted;
  }

  /**
   * Đếm tổng số nhân viên trong hệ thống.
   *
   * @returns Số lượng nhân viên
   */
  async countAll(): Promise<number> {
    return await this.NhanVienRepo.countAll();
  }
}
