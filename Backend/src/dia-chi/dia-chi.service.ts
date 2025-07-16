import { Injectable } from '@nestjs/common';
import { DiaChiRepository } from './dia-chi.repository';
import { TinhThanh, XaPhuong } from './schemas/dia-chi.schema';

@Injectable()
export class DiaChiService {
  constructor(private readonly DiaChiRepo: DiaChiRepository) {}

  async getAllProvinces(): Promise<{ T_id: number; T_ten: string }[]> {
    return this.DiaChiRepo.getAllProvinces();
  }

  async getWardsByProvinceId(provinceId: number): Promise<XaPhuong[]> {
    return this.DiaChiRepo.getWardsByProvinceId(provinceId);
  }

  async getFullAddressText(
    provinceId: number,
    wardId: number
  ): Promise<string | undefined> {
    return this.DiaChiRepo.getFullAddressText(provinceId, wardId);
  }

  async getProvinceInfo(
    provinceId: number
  ): Promise<{ T_id: number; T_ten: string } | undefined> {
    return this.DiaChiRepo.getProvinceInfo(provinceId);
  }

  async findAll(): Promise<TinhThanh[]> {
    return this.DiaChiRepo.findAll();
  }

  async findByProvinceId(id: number): Promise<TinhThanh | undefined> {
    return this.DiaChiRepo.findByProvinceId(id);
  }

  async refetchLocation() {
    return this.DiaChiRepo.fetchLocation();
  }
}
