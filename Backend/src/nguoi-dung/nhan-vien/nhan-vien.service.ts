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

  protected async findAllIds(ids: string[]): Promise<NhanVien[]> {
    return this.NhanVienRepo.findAllIds(ids);
  }

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
        },
      };
    });
  }

  async findById(id: string): Promise<NhanVien> {
    const result = await this.NhanVienRepo.findById(id);
    if (!result) {
      throw new NotFoundException();
    }

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
  async create(newData: CreateNhanVienDto): Promise<NhanVien> {
    const session = await this.connection.startSession();

    try {
      let result: NhanVien;

      await session.withTransaction(async () => {
        const lastCode = await this.NhanVienRepo.findLastId(session);
        const numericCode = lastCode ? parseInt(lastCode, 10) : 0;
        const newNumericCode = numericCode + 1;
        const newCode = newNumericCode
          .toString()
          .padStart(this.codeLength, '0');

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

  async findAll(): Promise<NhanVien[]> {
    return await this.NhanVienRepo.findAll();
  }

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

  async countAll(): Promise<number> {
    return await this.NhanVienRepo.countAll();
  }
}
