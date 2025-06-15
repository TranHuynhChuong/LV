import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NhanVienRepository } from './nhanVien.repository';
import { CreateDto, UpdateDto } from './nhanVien.dto';
import { NhanVien } from './nhanVien.schema';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

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
  constructor(private readonly NhanVien: NhanVienRepository) {}

  protected async findAllIds(ids: string[]): Promise<NhanVien[]> {
    return this.NhanVien.findAllIds(ids);
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
    const result = await this.NhanVien.findById(id);
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
    private readonly NhanVien: NhanVienRepository,
    private readonly NhanVienUtils: NhanVienUtilService,
    @InjectConnection() private readonly connection: Connection
  ) {}
  async create(newData: CreateDto): Promise<NhanVien> {
    const session = await this.connection.startSession();

    try {
      let result: NhanVien;

      await session.withTransaction(async () => {
        const lastCode = await this.NhanVien.findLastId(session);
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

        const created = await this.NhanVien.create(
          {
            ...newData,
            NV_id: newCode,
            lichSuThaoTac: [thaoTac],
          },
          session
        );

        if (!created) throw new BadRequestException();
        result = created;
      });

      await session.endSession();
      return result!;
    } catch (error) {
      await session.endSession();
      throw error;
    }
  }

  async findAll(): Promise<NhanVien[]> {
    return await this.NhanVien.findAll();
  }

  async findById(id: string): Promise<any> {
    const result: any = await this.NhanVien.findById(id);
    if (!result) {
      throw new NotFoundException();
    }

    const lichSu = result.lichSuThaoTac ?? [];
    result.lichSuThaoTac =
      lichSu.length > 0 ? await this.NhanVienUtils.mapActivityLog(lichSu) : [];

    return result;
  }

  async update(id: string, newData: UpdateDto): Promise<NhanVien> {
    const existing = await this.NhanVien.findById(id);
    if (!existing) {
      throw new NotFoundException('Không tìm thấy nhân viên');
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

    const updated = await this.NhanVien.update(id, updatePayload);
    if (!updated) {
      throw new BadRequestException();
    }

    return updated;
  }

  async delete(id: string) {
    const deleted = await this.NhanVien.delete(id);
    if (!deleted) {
      throw new BadRequestException();
    }
    return deleted;
  }

  async countAll(): Promise<number> {
    return await this.NhanVien.countAll();
  }
}
