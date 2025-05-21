import { StaffsService, StaffInfo } from './../Users/Staffs/staffs.service';
import { Injectable } from '@nestjs/common';
import { ShippingFeeDto } from './shippingFee.dto';
import { ShippingFeeRepository } from './shippingFee.repository';
import { PHI_VAN_CHUYEN } from './shippingFee.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ShippingFeeService {
  private readonly dataDir = path.join(__dirname, 'data');
  constructor(
    private readonly ShippingFeeRepository: ShippingFeeRepository,
    private readonly StaffsService: StaffsService
  ) {}

  async createShippingFeet(
    dto: ShippingFeeDto
  ): Promise<PHI_VAN_CHUYEN | null> {
    const isExit = await this.ShippingFeeRepository.findByProvince(dto.T_id);
    if (isExit) {
      return null;
    } else {
      const id = await this.ShippingFeeRepository.findLastId();
      const newId = id + 1;
      return this.ShippingFeeRepository.create({ ...dto, VC_id: newId });
    }
  }

  async getAllShippingFee(): Promise<PHI_VAN_CHUYEN[]> {
    return this.ShippingFeeRepository.findAll();
  }

  async getShippingFeetById(id: string): Promise<{
    shippingFee: PHI_VAN_CHUYEN | null;
    staff: StaffInfo;
  }> {
    const result = await this.ShippingFeeRepository.findById(id);

    let staffInfo: StaffInfo = {
      NV_id: null,
      NV_hoTen: null,
      NV_email: null,
      NV_soDienThoai: null,
    };

    if (result) {
      const staff = await this.StaffsService.findById(result.NV_id);
      if (staff) {
        staffInfo = {
          NV_id: staff.staff.NV_idNV,
          NV_hoTen: staff.staff.NV_hoTen,
          NV_email: staff.staff.NV_email,
          NV_soDienThoai: staff.staff.NV_soDienThoai,
        };
      }
    }

    return {
      shippingFee: result,
      staff: staffInfo,
    };
  }

  async updateShippingFeet(
    id: string,
    dto: ShippingFeeDto
  ): Promise<PHI_VAN_CHUYEN | null> {
    return this.ShippingFeeRepository.update(id, dto);
  }

  async deleteShippingFeet(id: string): Promise<PHI_VAN_CHUYEN | null> {
    return this.ShippingFeeRepository.delete(id);
  }

  async countShippingFee(): Promise<number> {
    return this.ShippingFeeRepository.countAll();
  }

  loadAddressFiles(): { T_id: string; data: Record<string, unknown> }[] {
    const files = fs
      .readdirSync(this.dataDir)
      .filter((file) => file.endsWith('.json'))
      .sort(
        (a, b) =>
          Number(a.replace('.json', '')) - Number(b.replace('.json', ''))
      );

    const dataWithTId = files.map((file) => {
      const filePath = path.join(this.dataDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent) as Record<string, unknown>;

      return {
        T_id: file.replace('.json', ''),
        data,
      };
    });

    return dataWithTId;
  }
}
