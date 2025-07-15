import { Injectable } from '@nestjs/common';
import { DiaChi, DiaChiRepository, XaPhuong } from './dia-chi.repository';

@Injectable()
export class DiaChiService {
  constructor(private readonly DiaChiRepo: DiaChiRepository) {}

  getAllProvinces(): { T_id: number; T_ten: string }[] {
    return this.DiaChiRepo.getAllProvinces();
  }

  getWardsByProvinceId(provinceId: number): XaPhuong[] {
    return this.DiaChiRepo.getWardsByProvinceId(provinceId);
  }

  getFullAddressText(provinceId: number, wardId: number): string | undefined {
    return this.DiaChiRepo.getFullAddressText(provinceId, wardId);
  }

  getProvinceInfo(
    provinceId: number
  ): { T_id: number; T_ten: string } | undefined {
    return this.DiaChiRepo.getProvinceInfo(provinceId);
  }

  findAll(): DiaChi[] {
    return this.DiaChiRepo.findAll();
  }

  findByProvinceId(id: number): DiaChi | undefined {
    return this.DiaChiRepo.findByProvinceId(id);
  }
}
