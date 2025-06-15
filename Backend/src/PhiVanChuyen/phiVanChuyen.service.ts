import {
  ConflictException,
  NotFoundException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { NhanVienUtilService } from '../NguoiDung/NhanVien/nhanVien.service';
import { CreateDto, UpdateDto } from './phiVanChuyen.dto';
import { PhiVanChuyenRepository } from './phiVanChuyen.repository';
import { PhiVanChuyen } from './phiVanChuyen.schema';
import * as fs from 'fs';
import * as path from 'path';

const typeOfChange: Record<string, string> = {
  PVC_phi: 'Phí',
  PVC_ntl: 'Ngưỡng khối lượng',
  PVC_phuPhi: 'Phụ phí',
  PVC_dvpp: 'Đơ vị phụ phí',
  T_id: 'Khu vực',
};

@Injectable()
export class PhiVanChuyenService {
  private readonly dataDir = path.join(__dirname, 'data');

  constructor(
    private readonly PhiVanChuyen: PhiVanChuyenRepository,
    private readonly NhanVien: NhanVienUtilService
  ) {}

  async createShippingFee(newData: CreateDto): Promise<PhiVanChuyen> {
    const exists = await this.PhiVanChuyen.findById(newData.T_id);
    if (exists) {
      if (!exists.PVC_daXoa) {
        throw new ConflictException();
      }

      const thaoTac = {
        thaoTac: 'Khôi phục & cập nhật',
        NV_id: newData.NV_id,
        thoiGian: new Date(),
      };

      const updated = await this.PhiVanChuyen.update(newData.T_id, {
        ...newData,
        PVC_daXoa: false,
        lichSuThaoTac: [...(exists.lichSuThaoTac || []), thaoTac],
      });

      if (!updated) {
        throw new BadRequestException();
      }

      return updated;
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

    const lichSu = result.lichSuThaoTac ?? [];
    result.lichSuThaoTac =
      lichSu.length > 0 ? await this.NhanVien.mapActivityLog(lichSu) : [];

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
    const updatePayload: any = {};

    for (const key of Object.keys(newData)) {
      if (
        newData[key] !== undefined &&
        newData[key] !== existing[key] &&
        key !== 'NV_id' // bỏ qua NV_id khỏi danh sách so sánh
      ) {
        const label = typeOfChange[key] || key;
        fieldsChange.push(label);
        updatePayload[key] = newData[key]; // chỉ thêm trường có thay đổi
      }
    }

    if (fieldsChange.length > 0 && newData.NV_id) {
      const thaoTac = {
        thaoTac: `Cập nhật: ${fieldsChange.join(', ')}`,
        NV_id: newData.NV_id,
        thoiGian: new Date(),
      };

      updatePayload.lichSuThaoTac = [...existing.lichSuThaoTac, thaoTac];
    }

    // Nếu không có gì thay đổi, trả về bản ghi cũ
    if (Object.keys(updatePayload).length === 0) {
      return existing;
    }

    const updated = await this.PhiVanChuyen.update(id, updatePayload);
    if (!updated) {
      throw new BadRequestException('Cập nhật thất bại');
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

  async countAll(): Promise<number> {
    return this.PhiVanChuyen.countAll();
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
