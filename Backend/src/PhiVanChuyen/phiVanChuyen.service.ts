import {
  ConflictException,
  NotFoundException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import {
  NhanVienService,
  NhanVienInfo,
} from '../NguoiDung/NhanVien/nhanVien.service';
import { CreateDto, UpdateDto } from './phiVanChuyen.dto';
import { PhiVanChuyenRepository } from './phiVanChuyen.repository';
import { PhiVanChuyen } from './phiVanChuyen.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PhiVanChuyenService {
  private readonly dataDir = path.join(__dirname, 'data');

  constructor(
    private readonly PhiVanChuyen: PhiVanChuyenRepository,
    private readonly NhanVien: NhanVienService
  ) {}

  async createShippingFee(dto: CreateDto): Promise<PhiVanChuyen> {
    const exists = await this.PhiVanChuyen.findById(dto.T_id);
    if (exists) {
      throw new ConflictException();
    }
    const created = await this.PhiVanChuyen.create(dto);
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

    let nhanVien: NhanVienInfo = {
      NV_id: result.NV_id,
      NV_hoTen: null,
      NV_email: null,
      NV_soDienThoai: null,
    };

    if (result.NV_id) {
      const staff = await this.NhanVien.findById(result.NV_id);
      if (staff) {
        nhanVien = {
          NV_id: staff.NV_id,
          NV_hoTen: staff.NV_hoTen,
          NV_email: staff.NV_email,
          NV_soDienThoai: staff.NV_soDienThoai,
        };
        result.NV_id = nhanVien;
      }
    }
    return result;
  }

  async updateShippingFee(id: string, dto: UpdateDto): Promise<PhiVanChuyen> {
    const updated = await this.PhiVanChuyen.update(id, dto);
    if (!updated) {
      throw new BadRequestException();
    }
    return updated;
  }

  async deleteShippingFee(id: string): Promise<PhiVanChuyen> {
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
