import {
  ConflictException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { StaffsService, StaffInfo } from './../Users/Staffs/staffs.service';
import { ShippingFeeDto } from './shippingFee.dto';
import { ShippingFeeRepository } from './shippingFee.repository';
import { PHI_VAN_CHUYEN } from './shippingFee.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ShippingFeeService {
  private readonly dataDir = path.join(__dirname, 'data');

  constructor(
    private readonly shippingFeeRepository: ShippingFeeRepository,
    private readonly staffsService: StaffsService
  ) {}

  async createShippingFee(dto: ShippingFeeDto): Promise<PHI_VAN_CHUYEN> {
    const exists = await this.shippingFeeRepository.findById(dto.T_id);
    if (exists) {
      throw new ConflictException('Khu vực đã được tạo phí vận chuyển');
    }
    const created = await this.shippingFeeRepository.create(dto);
    if (!created) {
      throw new ConflictException('Tạo phí vận chuyển thất bại');
    }
    return created;
  }

  async getAllShippingFee(): Promise<PHI_VAN_CHUYEN[]> {
    return this.shippingFeeRepository.findAll();
  }

  async getShippingFeeById(
    id: number
  ): Promise<{ shippingFee: PHI_VAN_CHUYEN; staff: StaffInfo }> {
    const shippingFee = await this.shippingFeeRepository.findById(id);
    if (!shippingFee) {
      throw new NotFoundException('Phí vận chuyển không tồn tại');
    }

    let staffInfo: StaffInfo = {
      NV_id: null,
      NV_hoTen: null,
      NV_email: null,
      NV_soDienThoai: null,
    };

    if (shippingFee.NV_id) {
      const staff = await this.staffsService.findById(shippingFee.NV_id);
      if (staff) {
        staffInfo = {
          NV_id: staff.staff.NV_idNV,
          NV_hoTen: staff.staff.NV_hoTen,
          NV_email: staff.staff.NV_email,
          NV_soDienThoai: staff.staff.NV_soDienThoai,
        };
      }
    }

    return { shippingFee, staff: staffInfo };
  }

  async updateShippingFee(
    id: string,
    dto: ShippingFeeDto
  ): Promise<PHI_VAN_CHUYEN> {
    const updated = await this.shippingFeeRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(
        'Phí vận chuyển không tồn tại hoặc cập nhật thất bại'
      );
    }
    return updated;
  }

  async deleteShippingFee(id: string): Promise<PHI_VAN_CHUYEN> {
    const deleted = await this.shippingFeeRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(
        'Phí vận chuyển không tồn tại hoặc xóa thất bại'
      );
    }
    return deleted;
  }

  async countShippingFee(): Promise<number> {
    return this.shippingFeeRepository.countAll();
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
