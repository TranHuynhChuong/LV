import {
  ConflictException,
  NotFoundException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import {
  NhanVienService,
  ThaoTac,
} from '../NguoiDung/NhanVien/nhanVien.service';
import { CreateDto, UpdateDto } from './phiVanChuyen.dto';
import { PhiVanChuyenRepository } from './phiVanChuyen.repository';
import { PhiVanChuyen, LichSuThaoTacPVC } from './phiVanChuyen.schema';
import * as fs from 'fs';
import * as path from 'path';

const typeOfChange: Record<string, string> = {
  PVC_phi: 'Họ tên',
  PVC_ntl: 'Email',
  PVC_phuPhi: 'Số điện thoại',
  PVC_dvpp: 'Vai trò',
  T_id: 'Mật khẩu',
};

@Injectable()
export class PhiVanChuyenService {
  private readonly dataDir = path.join(__dirname, 'data');

  constructor(
    private readonly PhiVanChuyen: PhiVanChuyenRepository,
    private readonly NhanVien: NhanVienService
  ) {}

  async createShippingFee(newData: CreateDto): Promise<PhiVanChuyen> {
    const exists = await this.PhiVanChuyen.findById(newData.T_id);
    if (exists) {
      throw new ConflictException();
    }
    const thaoTac = {
      thaoTac: 'Tạo mới',
      NV_id: newData.NV_id,
      thoiGian: new Date(),
    };

    const created = await this.PhiVanChuyen.create({
      ...newData,
      lichSuThaoTac: [thaoTac],
    });
    if (!created) {
      throw new BadRequestException();
    }
    return created;
  }

  async getAllShippingFee(): Promise<Partial<PhiVanChuyen>[]> {
    return this.PhiVanChuyen.findAll();
  }

  async getShippingFeeById(id: number): Promise<any> {
    const result: any = await this.PhiVanChuyen.findById(id);
    if (!result) {
      throw new NotFoundException();
    }

    if (Array.isArray(result.lichSuThaoTacNV)) {
      result.lichSuThaoTac = await Promise.all(
        result.lichSuThaoTac.map(
          async (element: LichSuThaoTacPVC): Promise<ThaoTac> => {
            const nhanVien = await this.NhanVien.findById(element.NV_id);
            const thaoTac: ThaoTac = {
              thaoTac: element.thaoTac,
              thoiGian: element.thoiGian,
              nhanVien: {
                NV_id: null,
                NV_hoTen: null,
                NV_email: null,
                NV_soDienThoai: null,
              },
            };
            if (nhanVien) {
              result.nhanVien = {
                NV_id: nhanVien.NV_id,
                NV_hoTen: nhanVien.NV_hoTen,
                NV_email: nhanVien.NV_email,
                NV_soDienThoai: nhanVien.NV_soDienThoai,
              };
            }
            return thaoTac;
          }
        )
      );
    }
    return result;
  }

  async updateShippingFee(
    id: number,
    newData: UpdateDto
  ): Promise<PhiVanChuyen> {
    const existing = await this.PhiVanChuyen.findById(id);
    if (!existing) {
      throw new NotFoundException();
    }
    const fieldsChange: string[] = [];
    for (const key of Object.keys(newData)) {
      if (newData[key] !== undefined && newData[key] !== existing[key]) {
        const label = typeOfChange[key] || key;
        fieldsChange.push(label);
      }
    }

    const newLichSuThaoTac = [...existing.lichSuThaoTac];
    if (fieldsChange.length > 0 && newData.NV_id) {
      const thaoTac = {
        thaoTac: `Cập nhật: ${fieldsChange.join(', ')}`,
        NV_id: newData.NV_id,
        thoiGian: new Date(),
      };
      newLichSuThaoTac.push(thaoTac);
    }

    const updateObject = {
      ...newData,
      lichSuThaoTac: newLichSuThaoTac,
    };

    const updated = await this.PhiVanChuyen.update(id, updateObject);
    if (!updated) {
      throw new BadRequestException();
    }

    return updated;
  }

  async deleteShippingFee(id: number): Promise<PhiVanChuyen> {
    const deleted = await this.PhiVanChuyen.delete(id);
    if (!deleted) {
      throw new BadRequestException();
    }
    return deleted;
  }

  loadAddressFiles(): { T_id: string; data: Record<string, unknown> }[] {
    const files = fs
      .readdirSync(this.dataDir)
      .filter((file) => file.endsWith('.json'))
      .sort(
        (a, b) =>
          Number(a.replace('.json', '')) - Number(b.replace('.json', ''))
      );

    return files.map((file) => {
      const filePath = path.join(this.dataDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent) as Record<string, unknown>;

      return {
        T_id: file.replace('.json', ''),
        data,
      };
    });
  }
}
